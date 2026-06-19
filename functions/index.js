const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

/* SAFE INIT (won't crash Cloud Run) */
let client;

try {
  client = twilio(
    functions.config().twilio.sid,
    functions.config().twilio.token
  );
} catch (e) {
  console.log("Twilio not initialized yet");
}

exports.sendWhatsApp = functions.https.onCall(async (data) => {

  const phone = data.phone;
  const message = data.message;

  if (!client) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Twilio not configured"
    );
  }

  return client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: message
  });

});