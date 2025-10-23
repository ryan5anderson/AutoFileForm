import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ1KpDTSpotXxxuga10R7esZMfWxM3evM",
  authDomain: "opi-college-orders.firebaseapp.com",
  projectId: "opi-college-orders",
  storageBucket: "opi-college-orders.firebasestorage.app",
  messagingSenderId: "394391948167",
  appId: "1:394391948167:web:fa5ec7bb9ef50a3ea82122",
  measurementId: "G-36NWS5BTPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional, for tracking usage)
export const analytics = getAnalytics(app);

export default app;
