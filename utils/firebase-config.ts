import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_APPID,
}

// Initialize Firebase app
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

const firestore: Firestore = getFirestore(app);
const auth = getAuth(app)
const storage = getStorage(app)

// Set persistence for the Firebase auth
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.log(error.code, error.message)
})

export const getFirebaseApp = (): FirebaseApp => app
export { storage, auth, firestore }