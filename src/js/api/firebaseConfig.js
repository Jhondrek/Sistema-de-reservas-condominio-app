  // Import the functions you need from the SDKs you need
import { initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {  getAuth, 
            createUserWithEmailAndPassword,
            onAuthStateChanged,
            updateProfile,
            GoogleAuthProvider,
            signInWithPopup,
            signOut,
            fetchSignInMethodsForEmail,
            signInWithEmailAndPassword,
            sendPasswordResetEmail    
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js'

import { getFirestore, 
            addDoc, 
            collection, 
            getDocs,
            query, 
            where,
            getDoc,
            doc,
            deleteDoc   
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js'

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnemgjgwSjDn7dv1pIqcb32o5HYrnSjjk",
    authDomain: "sistemadereservasvalencia.firebaseapp.com",
    projectId: "sistemadereservasvalencia",
    storageBucket: "sistemadereservasvalencia.firebasestorage.app",
    messagingSenderId: "917990998734",
    appId: "1:917990998734:web:c7c5187fb32d8e573d069f"
};

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app)
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export {createUserWithEmailAndPassword, 
        auth, 
        onAuthStateChanged, 
        updateProfile, 
        firestore, 
        addDoc, 
        db, 
        collection,
        getDocs,
        query, 
        where,
        getDoc,
        GoogleAuthProvider,
        provider,
        signInWithPopup,
        signOut,
        fetchSignInMethodsForEmail,
        signInWithEmailAndPassword,
        getAuth,
        doc,
        deleteDoc,
        sendPasswordResetEmail 
}