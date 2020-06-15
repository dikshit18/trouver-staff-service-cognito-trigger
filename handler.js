require("dotenv").config();
const CryptoJS = require("crypto-js");
const moment = require("moment");
const { signupHtml } = require("./html/signup");
const { dynamoDb } = require("./dbConfig/dynamoDb");

exports.handler = async (event, context, callback) => {
  console.log("Event from Lambda Trigger: ", event);
  const { codeParameter } = event.request;
  const { email, sub } = event.request.userAttributes;
  try {
    const encryptedSub = encryptSub(sub); //Encryting Sub to send to over the URL
    if (
      event.triggerSource === "CustomMessage_SignUp"
      //event.triggerSource === "CustomMessage_ResendCode"
    ) {
      //const url = `https://ss-cognito-auth.s3-ap-southeast-2.amazonaws.com/index.html`; //Static Page URL
      //const url = 'id.ehgqa.com/validation';
      const url = process.env.VERIFICATION_URL;
      const link = `${url}?code=${codeParameter}&token=${encryptedSub}`;
      event.response.emailSubject = "New account created";
      event.response.emailMessage = signupHtml(link, email);
      await addSignUpDetails(sub, email, encryptedSub); //Saving Token details to DB.
      // context.done(null, event);
      callback(null, event);
    }
    // else if (event.triggerSource === "CustomMessage_ForgotPassword") {
    //   const url = process.env.VERIFICATION_URL;
    //   const link = `${url}?code=${codeParameter}&action=forgotPassword&token=${encryptedSub}`;
    //   event.response.emailSubject = "Password reset request";
    //   event.response.emailMessage = forgotPassword(link, email);
    //   await addPasswordRecoveryDetails(sub, email, encryptedSub); //Saving Token details to DB.
    //   // context.done(null, event);
    //   callback(null, event);
    // }
  } catch (err) {
    console.log("==>", err);
    event.response.emailSubject = "Welcome to Trouver !";
    event.response.emailMessage =
      "Dear User,We are unable to verify your email address. <br/>Please contact to Administrator for further details." +
      "<br/>Sorry for the inconvenience.";
    // context.done(null, event);
    callback(err, event);
  }
};

const encryptSub = sub => {
  if (sub) return CryptoJS.AES.encrypt(sub, process.env.SECRET_KEY).toString();
};

const addSignUpDetails = async (cognitoSub, email, token) => {
  const params = {
    TableName: process.env.SIGNUP_TOKEN_DETAILS_TABLE_NAME,
    Item: {
      email,
      cognitoSub,
      token,
      created: moment.utc().format()
    }
  };
  await dynamoDb.create(params);
  return;
};

const addPasswordRecoveryDetails = async (identity_id, email, token) => {
  await savePasswordRecoveryDetails({
    identity_id,
    email,
    token
  });
};

// let event = {
//   version: "1",
//   region: "ap-southeast-2",
//   userPoolId: "ap-southeast-2_wCKNXhCiz",
//   userName: "9452abac-3c9e-4c21-b93c-138aac2f1622",
//   callerContext: {
//     awsSdkVersion: "aws-sdk-unknown-unknown",
//     clientId: "2a0v2nl3jssdrj4rov2kv7515u"
//   },
//   triggerSource: "CustomMessage_SignUp",
//   request: {
//     userAttributes: {
//       sub: "9452abac-3c9e-4c21-b93c-138aac2f1622",
//       "cognito:user_status": "UNCONFIRMED",
//       email_verified: "false",
//       "cognito:email_alias": "shrutika.yawale@blazeclan.com",
//       email: "shrutika.yawale@blazeclan.com"
//     },
//     codeParameter: "{####}",
//     linkParameter: "{##Click Here##}",
//     usernameParameter: null
//   },
//   response: { smsMessage: null, emailMessage: null, emailSubject: null }
// };
// exports
//   .handler(event)
//   .then(data => console.log("Data is ...", data))
//   .catch(error => console.log("Error is...", error));
