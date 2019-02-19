def label = "jenkins-node-${UUID.randomUUID().toString()}"
podTemplate(label: label, containers: [
        containerTemplate(name: 'node', image: '086658912680.dkr.ecr.eu-west-1.amazonaws.com/cvs/nodejs-builder:latest', ttyEnabled: true, alwaysPullImage: true, command: 'cat'),]){
    node(label) {

        stage('checkout') {
            checkout scm
        }
        
        container('node'){    
            withFolderProperties{
                LBRANCH="${env.BRANCH}".toLowerCase()
            }    
            
            sh "cp -r /tmp/seed ."
            
            dir('seed'){
                
                stage ("npm deps") {
                    sh "npm install"
                }

                stage ("credentials") {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'jenkins-np-iam', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "sls config credentials --provider aws --key ${AWS_ACCESS_KEY_ID} --secret ${AWS_SECRET_ACCESS_KEY}"
                    }
                }
                
                stage ("delete-table") {
    
                    sh "aws dynamodb delete-table --table-name cvs-${LBRANCH}-activities --region=eu-west-1 || true"
                    sh "aws dynamodb wait table-not-exists --table-name cvs-${LBRANCH}-activities --region=eu-west-1"

                }
                
                sh '''
                    aws dynamodb create-table \
                    --region=eu-west-1 \
                    --endpoint-url http://localhost:8005 \
                    --table-name cvs-local-activities \
                    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=testerStaffId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --global-secondary-indexes IndexName=StaffIndex,KeySchema=[{AttributeName=testerStaffId,KeyType=HASH}],Projection={ProjectionType=INCLUDE,NonKeyAttributes=[activityType,testStationName,testStationNumber,testStationEmail,testStationType,testerName,startTime,endTime]},ProvisionedThroughput="{ReadCapacityUnits=1,WriteCapacityUnits=1}"
                '''

                sh "sls dynamodb seed --seed=activities"
                
                stage ("seed-table") {
                        sh "./seed.js cvs-${LBRANCH}-activities ../tests/resources/activities.json"
                }
            }
        }
    }
}
