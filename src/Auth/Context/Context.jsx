import { createContext, useEffect, useState } from "react";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import app from "../Firebase/Firebase";

export const Contexts = createContext();

const auth = getAuth(app);


// eslint-disable-next-line react/prop-types
const Context = ({children}) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);


    // Set an authentication state observer and get user data

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, user => {
            setUser(user);
            setLoading(false);
        })
        return () => {
            unSubscribe();
        }
    }, [])

    // loading spinner

    // Google login 
    const provider  = new GoogleAuthProvider();

    const google = () =>{
        return signInWithPopup(auth , provider);
    }

    // email and password register
    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }
    
    // email and password login
    const loginUser = (email, password) => {
        setLoading(true)
        return signInWithEmailAndPassword(auth, email, password);
    }

    // forgot password
    const forgotPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
     }

    // logout
    const LogOut = () => {
        return signOut(auth);
    }
    const info = {
        user,
        loading,
        google,
        createUser,
        loginUser,
        forgotPassword,
        LogOut
    }


    


    return (
        <Contexts.Provider value={info}>
            {children}
        </Contexts.Provider>
    );
};

export default Context;