import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCvfZY-pYKubTF8u55ztRNvNdFhiyqwA7g",
  authDomain: "collegecampus-e2017.firebaseapp.com",
  projectId: "collegecampus-e2017",
  storageBucket: "collegecampus-e2017.firebasestorage.app",
  messagingSenderId: "974664696052",
  appId: "1:974664696052:web:add1a4f442b396d81b9ea1",
  measurementId: "G-XWKQ1MN7KL"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app