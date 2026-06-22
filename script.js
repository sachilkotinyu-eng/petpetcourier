console.log("SCRIPT START ✔");

/* ================= FIREBASE SETUP ================= */
const firebaseConfig = {
    apiKey: "AIzaSyB99PoEbCH404o6fRq15c-K7pzq6AhzefA",
    authDomain: "pet-pet-courier.firebaseapp.com",
    projectId: "pet-pet-courier",
    storageBucket: "pet-pet-courier.appspot.com",
    messagingSenderId: "665354131418",
    appId: "1:665354131418:web:90551539ecd71f9399d2e3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

/* ================= DEBUG ================= */
console.log("FIREBASE READY ✔");

/* ================= CREATE SHIPMENT ================= */
function createShipment() {
    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;
    const email = document.getElementById("email").value;
    const item = document.getElementById("item").value;
    const destination = document.getElementById("destination").value;
    const route = document.getElementById("route").value;

    const shipmentData = {
        sender,
        receiver,
        email,
        item,
        destination,
        route,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "Pending"
    };

    const trackingId = "PET-" + Math.floor(100000 + Math.random() * 900000);

db.collection("shipments").doc(trackingId).set(shipmentData)
        .then((docRef) => {

            // ✅ WhatsApp message (ADDED FEATURE ONLY)
            const message =
                `📦 *New Shipment Created*\n\n` +
                `🆔 ID:Tracking ID: ${trackingId}\n` +
                `👤 Sender: ${sender}\n` +
                `📦 Receiver: ${receiver}\n` +
                `📧 Email: ${email}\n` +
                `📍 Pickup: ${item}\n` +
                `🎯 Destination: ${destination}\n` +
                `🚚 Route: ${route}`;

            const phoneNumber = "260973529051";
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappURL, "_blank");

        })
        .catch((error) => {
            console.error("Error creating shipment:", error);
            alert("Failed to create shipment. Try again.");
        });
}

/* ================= TRACK SHIPMENT ================= */
function trackShipment(){

    const id = document.getElementById("trackId").value;
    const result = document.getElementById("trackResult");

    const steps = [
        "Created",
        "Picked Up",
        "In Transit",
        "Border Clearance",
        "Delivered"
    ];

    db.collection("shipments").doc(id).get().then(doc=>{

        if(!doc.exists){
            result.innerHTML = "Not found";
            return;
        }

        const data = doc.data();

        let html = `<h3>${id}</h3>`;

        steps.forEach((step,i)=>{

            let cls = i <= data.statusIndex ? "completed" : "pending";

            html += `
                <div class="timeline-item ${cls}">
                    ${step}
                </div>
            `;
        });

        result.innerHTML = html;
    });
}

/* ================= ADMIN LOGIN ================= */
window.loginAdmin = async function () {

    const email = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value;
    const msg = document.getElementById("loginMsg");

    try {
        await auth.signInWithEmailAndPassword(email, password);

        msg.innerHTML = "Login successful ✔";

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("admin").style.display = "block";

    } catch (error) {
        msg.innerHTML = error.message;
    }
};

/* ================= LOGOUT ================= */
window.logoutAdmin = async function () {
    await auth.signOut();
    alert("Logged out");
};

/* ================= WHATSAPP FUNCTION CALL ================= */
const sendWhatsApp = firebase.functions().httpsCallable("sendWhatsApp");

/* ================= UPDATE STATUS (EMAIL + WHATSAPP) ================= */
window.updateStatus = async function () {

    const id = document.getElementById("adminId").value;
    const status = Number(document.getElementById("status").value);
    const msg = document.getElementById("adminMsg");

    if (!id) {
        msg.innerHTML = "Enter Tracking ID";
        return;
    }

    try {

        const docRef = db.collection("shipments").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            msg.innerHTML = "Shipment not found";
            return;
        }

        const data = doc.data();

        // ================= STATUS TEXT =================
        const statusNames = [
            "Created",
            "Picked Up",
            "In Transit",
            "Border Clearance",
            "Delivered"
        ];

        const statusText = statusNames[status] || "Unknown";

        // ================= UPDATE FIREBASE =================
        await docRef.update({
            statusIndex: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.innerHTML = "Status updated ✔";

        // ================= EMAILJS =================
        if (data.email && data.email.trim() !== "") {

            emailjs.send(
                "service_tnz5iuk",
                "template_7ud6j5a",
                {
                    to_name: data.receiver || "Customer",
                    email: data.email,
                    trackingNumber: id,
                    status: statusText,
                    company: "Pet Pet Courier",
                    message_title: "Shipment Update Notification",
                    footer: "Thank you for trusting Pet Pet Courier 🚚"
                }
            )
            .then(res => {
                console.log("EMAIL SENT ✔", res);
            })
            .catch(err => {
                console.error("EMAIL FAILED ❌", err);
            });
        }

                // ================= WHATSAPP =================
        if (data.phone && data.phone.trim() !== "") {

            const sendWhatsApp =
                firebase.functions().httpsCallable("sendWhatsApp");

            const cleanPhone = data.phone.replace(/\s/g, "");

            sendWhatsApp({
                phone: cleanPhone,
                message: `📦 Pet Pet Courier Update

Tracking ID: ${id}
Status: ${statusText}

Thank you for using our service 🚚`
            })
            .then(() => {
                console.log("WhatsApp sent ✔");
            })
            .catch(err => {
                console.error("WhatsApp error ❌", err);
            });

        } else {
            console.log("No phone number — skipping WhatsApp");
        }

    } catch (error) {
        console.error(error);
        msg.innerHTML = "Update failed";
    }
};
// AFTER FIREBASE SUCCESS (DO NOT REMOVE YOUR EXISTING CODE ABOVE THIS)

