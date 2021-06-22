# cvs-svc-activities

## Introduction

The activities microservice used CVS services and mobile application allows to create activities when the VSA perform tests.

## Dependencies

The project runs on node 10.x with typescript and serverless framework. For further details about project dependencies, please refer to the `package.json` file.
[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) is used to managed node versions and configuration explicitly done per project using an `.npmrc` file.

### Prerequisites

Please install and run the following securiy programs as part of your development process:

- [git-secrets](https://github.com/awslabs/git-secrets)
  After installing, do a one-time set up with `git secrets --register-aws`. Run with `git secrets --scan`.

- [repo-security-scanner](https://github.com/UKHomeOffice/repo-security-scanner)

These will be run as part of your projects hooks so you don't accidentally introduce any new security vulnerabilities.

## Architecture

Data is used is made available to VTA for searching a vehicle.

### End to end design

[All in one view](https://wiki.dvsacloud.uk/pages/viewpage.action?pageId=79254695)

### Activities microservice

More information about technical designs can be found under the [Defects Microservice](https://wiki.dvsacloud.uk/display/HVT/Activities+Service) section.

## Getting started

Set up your nodejs environment running `nvm use` and once the dependencies are installed using `npm i`, you can run the scripts from `package.json` to build your project.
This code repository uses [serverless framework](https://www.serverless.com/framework/docs/) to mock AWS capabilities for local development.
You will also require to install dynamodb serverless to run your project with by running the following command `node_modules/.bin/sls dynamodb install` in your preferred shell.
Please refer to the local development section to [configure your project locally](#developing-locally)

### Environmental variables

- The `BRANCH` environment variable indicates in which environment is this application running. Not setting this variable will result in defaulting to `local`.

### Configuration

#### Branch

The configuration file can be found under `src/config/config.yml`.
Environment variable injection is possible with the syntax:
`${BRANCH}`, or you can specify a default value: `${BRANCH:local}`

The real lambda function of this repository can be found under `src/handler.ts`, and is a middleware function that calls lambda functions created by you according to the mapping declared in the configuration.
Here is an example:

```yml
functions:
  - startActivity:
      method: POST
      path: /activities
      proxy: null
      function: startActivity
  - endActivity:
      method: PUT
      path: /activities/{+proxy}
      proxy: :id/end
      function: endActivity
```

#### Serverless

For serverless, you need to specify the port number. This is required for integration testing. The `basePath` specifies the base path of the URL on the AWS environment. This is tied to the `BRANCH` environment variable.

```yml
serverless:
  basePath: ${BRANCH}
  port: 3007
```

#### DynamoDB

The following configuration declares two DynamoDB configurations. One for the local environment, and one for other environments. For the local environment, it is required to specify the primary keys in the config as well.

```yml
dynamodb:
  local:
    params:
      region: localhost
      endpoint: http://localhost:8005
    table: cvs-local-activities
    keys:
      - id
  remote:
    params: {}
    table: cvs-${BRANCH}-activities
```

### Scripts

The following scripts are available, however you can refer to the `package.json` to see the details:

- `npm install`
- `npm start`
- `npm run build`
- `npm t`

### DynamoDB and seeding

If you want the database to be populated with mock data on start, in your `serverless.yml` file, you need to set `seed` to `true`. You can find this setting under `custom > dynamodb > start`.

By default, the `noStart` setting under `custom > dynamodb > start` is true. That means the DynamoDB instance will not be started automatically. To start the instance automatically on `npm run start`, you have to set this value to `false`.

If you choose to run the DynamoDB instance separately, you can send the seed command with the following command:

`sls dynamodb seed --seed=defects`

Under `custom > dynamodb > seed` you can define new seed operations with the following config:

```yml
custom:
  dynamodb:
    seed:
      [SEED NAME HERE]:
        sources:
          - table: [TABLE TO SEED]
```

### Developing locally

The following configuration must be updated in your `serverless.yml` to be able to run the service locally.

To run this locally, add the following environment variables to your run configuration(s):

```yml
# **NB: Do not push these changes. They are for local running only**
migrate: true
seed: true
noStart: false
```

### Debugging

The following environmental variables can be given to your serverless scripts to trace and debug your service:

```shell
AWS_XRAY_CONTEXT_MISSING = LOG_ERROR
SLS_DEBUG = *
BRANCH = local
```

## Testing

Jest is used for unit testing.
Please refer to the [Jest documentation](https://jestjs.io/docs/en/getting-started) for further details.

### Unit test

In order to test, you need to run the following:

```sh
npm run test # unit tests
```

### Integration test

In order to test, you need to run the following, with the service running locally:

```sh
npm run test-i # for integration tests
```

### End to end

- [Automation test repository](https://github.com/dvsa/cvs-auto-svc)
- [Java](https://docs.oracle.com/en/java/javase/11/)
- [Serenity Cucumber with Junit](https://serenity-bdd.github.io/theserenitybook/latest/junit-basic.html)

## Infrastructure

We follow a [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) approach for development.
For the CI/CD and automation please refer to the following pages for further details:

- [Development process](https://wiki.dvsacloud.uk/display/HVT/CVS+Pipeline+Infrastructure)
- [Pipeline](https://wiki.dvsacloud.uk/pages/viewpage.action?pageId=36870584)

## Contributing

### Hooks and code standards

The projects has multiple hooks configured using [husky](https://github.com/typicode/husky#readme) which will execute the following scripts: `security-checks`, `audit`, `tslint`, `prepush`.
The codebase uses [typescript clean code standards](https://github.com/labs42io/clean-code-typescript) as well as sonarqube for static analysis.

SonarQube is available locally, please follow the instructions below if you wish to run the service locally (brew is the preferred approach).

### Static code analysis

_Brew_ (recommended):

- Install sonarqube using brew
- Change `sonar.host.url` to point to localhost, by default, sonar runs on `http://localhost:9000`
- run the sonar server `sonar start`, then perform your analysis `npm run sonar-scanner`

_Manual_:

- [Download sonarqube](https://www.sonarqube.org/downloads/)
- Add sonar-scanner in environment variables in your profile file add the line: `export PATH=<PATH_TO_SONAR_SCANNER>/sonar-scanner-3.3.0.1492-macosx/bin:$PATH`
- Start the SonarQube server: `cd <PATH_TO_SONARQUBE_SERVER>/bin/macosx-universal-64 ./sonar.sh start`
- In the microservice folder run the command: `npm run sonar-scanner`
