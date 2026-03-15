const functions = require("firebase-functions");

// Set global options for all functions
functions.setGlobalOptions({ maxInstances: 10 });

// Import and export authentication functions
const { authLogin } = require("./auth-login");
const { authRegister } = require("./auth-register");

exports.login = authLogin;
exports.register = authRegister;

// Example of another function (can be removed if not needed)
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
