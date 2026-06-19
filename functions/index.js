const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

/* Twilio client */
const client = twilio(
  functions.config().twilio.sid,
  functions.config().twilio.token
);

exports.sendWhatsApp = functions.https.onCall(async (data) => {

  try {

    const phone = data.phone;
    const message = data.message;

    return await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phone}`,
      body: message
    });

  } catch (error) {
    console.error("TWILIO ERROR:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }

});