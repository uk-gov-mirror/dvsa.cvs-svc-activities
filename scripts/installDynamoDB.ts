import util from 'util';
import { exec } from 'child_process';
const shell = util.promisify(exec);

const installDynamoDB = async () => {
  // the pipeline currently has a global version of sls installed,
  // We want our local version to be used as we are not sure whether sls follows semver co
  const { stderr, stdout } = await shell(
    `${process.cwd()}/node_modules/.bin/sls dynamodb install`
  );
  if (stderr) {
    console.error(stderr);
    throw new Error(`Couldn't install DynamoDB`);
  }
  console.info(stdout);
};

(async () => await installDynamoDB())();
