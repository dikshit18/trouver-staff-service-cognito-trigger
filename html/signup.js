exports.signupHtml = (link, email) => {
  return `<html><h1>Welcome ${email}. </h1>
  <p>Please set your password <a href=${link}> here. </a>
    </html>`;
};
