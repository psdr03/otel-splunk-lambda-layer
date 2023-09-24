module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        splunk_access_token: process.env.SPLUNK_ACCESS_TOKEN,
        realm: process.env.SPLUNK_REALM,
        input: event,
      },
      null,
      2
    ),
  };
};
