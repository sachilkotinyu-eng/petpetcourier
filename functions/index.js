const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendWhatsApp = functions.https.onCall(async (data) => {
  return {
    success: true,
    message: "Function is working"
  };
});