import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import "firebase/compat/storage";

//LUCETE
const firebaseConfig_ = {
  apiKey: process.env.REACT_APP_LUCETE_API_KEY,
  authDomain: process.env.REACT_APP_LUCETE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_LUCETE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_LUCETE_BUCKET,
  messagingSenderId: process.env.REACT_APP_LUCETE_SENDER_ID,
  appId: process.env.REACT_APP_LUCETE_APP_ID
}
const firebaseApp_ = firebase.initializeApp(firebaseConfig_, "LUCETE");

// JHJ361217
const firebaseConfig = {
    apiKey: process.env.REACT_APP_JHJ_API_KEY,
    authDomain: process.env.REACT_APP_JHJ_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_JHJ_PROJECT_ID,
    storageBucket: process.env.REACT_APP_JHJ_BUCKET,
    messagingSenderId: process.env.REACT_APP_JHJ_SENDER_ID,
    appId: process.env.REACT_APP_JHJ_APP_ID,
    measurementId: process.env.REACT_APP_JHJ_MEASUREMENT_ID
}
const firebaseApp = firebase.initializeApp(firebaseConfig, "JHJ361217");

export const auth = firebaseApp.auth();
export const firestore = firebaseApp.firestore();
export const firestore_ = firebaseApp_.firestore();
export const storage = firebaseApp.storage();
