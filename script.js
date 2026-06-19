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

        // 1. Get shipment first (needed for email)
        const docRef = db.collection("shipments").doc(trackingId);
        const doc = await docRef.get();

        if (!doc.exists) {
            msg.innerHTML = "Shipment not found";
            return;
        }

        const data = doc.data();

        // 2. Update Firestore
        await docRef.update({
            statusIndex: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.innerHTML = "Status updated ✔";

        // 3. SEND EMAIL (EmailJS)
        emailjs.send(
            "service_tnz5iuk",
            "template_7ud6j5a",
            {
                to_name: data.receiverName || "Customer",
                email: data.email,
                trackingNumber: trackingId,
                status: status
            }
        ).then(() => {
            console.log("Email sent ✔");
        }).catch((err) => {
            console.error("Email failed:", err);
        });

    } catch (error) {
        console.error(error);
        msg.innerHTML = "Update failed";
    }
};