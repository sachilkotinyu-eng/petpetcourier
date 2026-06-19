console.log("STEP 1 REACHED");
console.log("FIREBASE LOADED");
console.log("JS IS WORKING");
/* FIREBASE SETUP */
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

/* TEST */
console.log("SCRIPT LOADED");

/* CREATE SHIPMENT */
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
        trackingId,
        statusIndex: 0,
        createdAt: new Date()
    });

    document.getElementById("output").innerHTML =
        "Tracking ID: " + trackingId;
}

/* TRACK */
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

            let cls = i <= data.statusIndex ? "completed" : "active";

            html += `
                <div class="timeline-item ${cls}">
                    ${step}
                </div>
            `;
        });

        result.innerHTML = html;
    });
}

/* ADMIN */
function updateStatus(){

    const id = document.getElementById("adminId").value;
    const status = parseInt(document.getElementById("status").value);

    db.collection("shipments").doc(id).update({
        statusIndex: status
    }).then(()=>{

        document.getElementById("adminMsg").innerHTML =
            "Status updated!";
    });
}