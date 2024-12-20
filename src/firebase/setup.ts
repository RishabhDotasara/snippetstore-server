import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDRVTIuBpsRkU6f3W07X0Cn1rdn-sHAvxs",
  authDomain: "snippetstore-b9bd5.firebaseapp.com",
  projectId: "snippetstore-b9bd5",
  storageBucket: "snippetstore-b9bd5.firebasestorage.app",
  messagingSenderId: "250115423775",
  appId: "1:250115423775:web:91f4188a971356ef28df2a",
  measurementId: "G-VM5SKD0XDL",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export async function verifyIdToken(token: string): Promise<string | null> {
  try {
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken) return null;

    return decodedToken.uid;
  } catch (error) {
    console.log(`[ERROR] verifyIdToken: ${error}`);

    return null;
  }
}
