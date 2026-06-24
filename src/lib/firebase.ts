import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAn6Qqmwj7pO2Gdp_zUUTstjCHlh3E9GnU",
  authDomain: "gen-lang-client-0307343274.firebaseapp.com",
  projectId: "gen-lang-client-0307343274",
  storageBucket: "gen-lang-client-0307343274.firebasestorage.app",
  messagingSenderId: "320242385965",
  appId: "1:320242385965:web:6508b8d0d644a8413e24a4"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Exports
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper for authorized admin accounts verification
// By user request: "only admin accounts are verified no accounts are login in admin panel"
const VERIFIED_ADMIN_EMAILS = [
  'juhebminecrft7@gmail.com',
  'admin@bdxnetwork.net',
  'juheb@bdxnetwork.net'
];

export function isVerifiedAdmin(email: string | null): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase().trim();
  // Allow whitelisted emails or any email with @bdxnetwork.net domain
  return VERIFIED_ADMIN_EMAILS.includes(emailLower) || emailLower.endsWith('@bdxnetwork.net');
}
