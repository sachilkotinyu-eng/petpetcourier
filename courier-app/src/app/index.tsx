import { useState } from "react";
import { View, Text, TextInput, Button, Image } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB99PoEbCH404o6fRq15c-K7pzq6AhzefA",
  authDomain: "pet-pet-courier.firebaseapp.com",
  projectId: "pet-pet-courier",
  storageBucket: "pet-pet-courier.appspot.com",
  messagingSenderId: "665354131418",
  appId: "1:665354131418:web:90551539ecd71f9399d2e3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function HomeScreen() {
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("");

  const trackPackage = async () => {
    try {
      const ref = doc(db, "tracking", trackingId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setStatus(snap.data().status);
      } else {
        setStatus("Tracking ID not found");
      }
    } catch (err) {
      setStatus("Error loading data");
    }
  };

  return (
    <View style={{ flex: 1, padding: 40, marginTop: 60 }}>

      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: 200,
          height: 80,
          resizeMode: "contain",
          alignSelf: "center",
          marginBottom: 20
        }}
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center" }}>
        📦 Courier Tracking
      </Text>

      <TextInput
        placeholder="Enter Tracking ID"
        value={trackingId}
        onChangeText={setTrackingId}
        style={{
          borderWidth: 1,
          marginTop: 20,
          padding: 10,
          borderRadius: 5
        }}
      />

      <Button title="Track Package" onPress={trackPackage} />

      <Text style={{ marginTop: 20, fontSize: 18 }}>
        Status: {status}
      </Text>

    </View>
  );
}