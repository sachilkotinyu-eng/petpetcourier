console.log("SCRIPT START");

const firebaseConfig = {
    apiKey: "AIzaSyB99PoEbCH404o6fRq15c-K7pzq6AhzefA",
    authDomain: "pet-pet-courier.firebaseapp.com",
    projectId: "pet-pet-courier",
    storageBucket: "pet-pet-courier.appspot.com",
    messagingSenderId: "665354131418",
    appId: "1:665354131418:web:90551539ecd71f9399d2e3"
};

/* 🔥 THIS IS REQUIRED */
firebase.initializeApp(firebaseConfig);



console.log("FIREBASE INITIALIZED ✔");
const auth = firebase.auth();
const db = firebase.firestore();

/* ================= LOGIN ================= */
window.loginAdmin = async function () {

    const email = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value.trim();
    const msg = document.getElementById("loginMsg");

    try {

        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;

        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            msg.innerHTML = "User profile missing in database";
            return;
        }

        const role = userDoc.data().role;

        msg.innerHTML = "Login successful ✔";

        document.getElementById("loginSection").style.display = "none";

        if (role === "admin") {
            document.getElementById("admin").style.display = "block";
        } else {
            alert("Customer login detected");
        }

    } catch (error) {
        msg.innerHTML = error.message;
    }
};


/* =========================
   AUTH STATE
========================= */
auth.onAuthStateChanged(async (users) => {

    const loginSection = document.getElementById("loginSection");
    const adminPanel = document.getElementById("admin");

    if (!users) {
        loginSection.style.display = "block";
        adminPanel.style.display = "none";
        return;
    }

    try {

        const userRef = db.collection("users").doc(users.uid);
        const userDoc = await userRef.get();

        // First login
        if (!userDoc.exists) {

            await userRef.set({
                email: user.email,
                role: "customer",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log("User profile created");

            loginSection.style.display = "block";
            adminPanel.style.display = "none";

            return;
        }

        const userData = userDoc.data();

        console.log("ROLE:", userData.role);

        if (userData.role === "admin") {

            loginSection.style.display = "none";
            adminPanel.style.display = "block";

        } else {

            loginSection.style.display = "block";
            adminPanel.style.display = "none";
        }

    } catch (error) {

        console.error("Role check failed:", error);

        loginSection.style.display = "block";
        adminPanel.style.display = "none";
    }
});

/* =========================
   LOGIN
========================= */
window.loginAdmin = async function () {

    const email = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value;
    const msg = document.getElementById("loginMsg");

    const loginSection = document.getElementById("loginSection");
    const adminPanel = document.getElementById("admin");

    msg.innerHTML = "";

    try {
        await auth.signInWithEmailAndPassword(email, password);

        msg.innerHTML = "Login successful ✔";

        // 👉 SWITCH UI HERE
        loginSection.style.display = "none";
        adminPanel.style.display = "block";

    } catch (error) {
        console.error(error);
        msg.innerHTML = "Login failed: " + error.message;
    }
};

/* =========================
   LOGOUT
========================= */
window.logoutAdmin = async function () {

    try {

        await auth.signOut();

        document.getElementById("loginMsg").innerHTML = "";

        alert("Logged out");

    } catch (error) {

        console.error(error);
    }
};

/* =========================
   UPDATE STATUS
========================= */
window.updateStatus = async function () {

    if (!auth.currentUser) {
        alert("Please login first");
        return;
    }

    const trackingId = document.getElementById("adminId").value.trim();
    const status = Number(document.getElementById("status").value);
    const msg = document.getElementById("adminMsg");

    if (!trackingId) {
        msg.innerHTML = "Enter Tracking ID";
        return;
    }

    try {

        await db.collection("shipments")
            .doc(trackingId)
            .update({
                statusIndex: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        msg.innerHTML = "Status updated ✔";

    } catch (error) {

        console.error(error);
        msg.innerHTML = "Update failed";
    }
};