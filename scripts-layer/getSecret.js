const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-1" }); // Replace 'us-east-1' with your desired region

const secretsManager = new AWS.SecretsManager();
async function getAndSetSecret() {
  try {
    const secretData = await secretsManager
      .getSecretValue({ SecretId: "dev/splunk-access-token" })
      .promise();
    if (secretData.SecretString) {
      console.log(`export SPLUNK_ACCESS_TOKEN="${secretData.SecretString}"`);
    } else {
      console.error("Secret not found or not in string format.");
    }
  } catch (error) {
    console.error("Error retrieving secret:", error);
  }
}

getAndSetSecret();
