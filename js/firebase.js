import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, COLLECTION_NAME, SCHEMA_VERSION } from "./config.js";

let db = null;

function isConfigReady() {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}

export function initFirebase() {
  if (!isConfigReady()) {
    return {
      ready: false,
      reason:
        "Firebase is not configured. Update js/config.js with your project values.",
    };
  }
  if (!db) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return { ready: true };
}

export async function submitQuestionnaire(data) {
  const init = initFirebase();
  if (!init.ready) {
    throw new Error(init.reason);
  }

  const payload = {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return docRef.id;
}

export function isFirebaseConfigured() {
  return isConfigReady();
}
