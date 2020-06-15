require("dotenv").config();
const AWS = require("aws-sdk");
// AWS.config.update({
//   region: "ap-south-1",
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
// });
const documentClient = new AWS.DynamoDB.DocumentClient({
  region: "ap-south-1"
});
const dynamoDb = (() => {
  return {
    create: params => {
      return new Promise((res, rej) => {
        console.log("params are ...", params);
        documentClient.put(params, (err, data) => {
          if (err) {
            console.log("Error while creating staff details... ", err);
            rej(err);
          } else {
            console.log("Succesfully creating staff details... ", data);
            res(data);
          }
        });
      });
    }
  };
})();
module.exports = { dynamoDb };
