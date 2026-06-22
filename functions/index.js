const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const client = twilio(
  "AC34a4f564a62606990e12fae38e0d99ba",
  "73b92ca72fb5555c9a15ae912fdddcf7"
);
exports.sendWhatsApp = functions.https.onCall(async (data) => {

  console.log("TEST RUN");

  const res = await client.messages.create({
    from: "whatsapp:+14155238886",
    to: "whatsapp:+260973529051",
    body: "TEST MESSAGE ONLY"
  });

  console.log(res);

  return { success: true };
});
