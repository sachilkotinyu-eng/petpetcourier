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
function createShipment(){

    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;
    const route = document.getElementById("route").value;

    if(!sender || !receiver){
        alert("Fill all fields");
        return;
    }

    const trackingId = "PET-" + Math.floor(Math.random()*999999);

    db.collection("shipments").doc(trackingId).set({
        sender,
        receiver,
        route,
        email: document.getElementById("email")?.value || "",
        phone: document.getElementById("phone")?.value || "",
        statusIndex: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("output").innerHTML =
        "Tracking ID: " + trackingId;
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

        // 1. Update Firestore
        await docRef.update({
            statusIndex: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.innerHTML = "Status updated ✔";

        // 2. EMAIL (EmailJS)
        emailjs.send(
            "service_tnz5iuk",
            "template_7ud6j5a",
            {
                to_name: data.receiver || "Customer",
                email: data.email,
                trackingNumber: id,
                status: status
            }
        ).catch(err => console.error("Email error:", err));

        // 3. WHATSAPP (Firebase Function)
        if (data.phone) {
            sendWhatsApp({
                phone: data.phone,
                message: `📦 Your parcel ${id} status is now: ${status}`
            }).then(() => {
                console.log("WhatsApp sent ✔");
            }).catch(err => {
                console.error("WhatsApp error:", err);
            });
        }

    } catch (error) {
        console.error(error);
        msg.innerHTML = "Update failed";
    }
};

function testWhatsApp() {

  const sendWhatsApp = firebase.functions().httpsCallable("sendWhatsApp");

  sendWhatsApp({
    phone: "+260973529051",
    message: "🚚 Test from courier system"
  })
  .then((res) => {
    console.log("SUCCESS:", res);
    alert("WhatsApp sent ✔");
  })
  .catch((err) => {
    console.error("ERROR FULL:", err);
    alert(err.message || "WhatsApp failed");
  });

}

