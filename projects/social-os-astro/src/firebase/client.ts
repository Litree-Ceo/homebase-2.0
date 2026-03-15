import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAw_rCpAgnRb2_CzYaXomr1LozBvZ8flVY",
    authDomain: "offical-site-f8bd3.firebaseapp.com",
    projectId: "offical-site-f8bd3",
    storageBucket: "offical-site-f8bd3.appspot.com",
    messagingSenderId: "302364901806",
    appId: "1:302364901806:web:588ac8b0198058d388c83f",
    measurementId: "G-V41VNBMY9T"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };