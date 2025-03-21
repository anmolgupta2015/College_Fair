import React, { useState } from "react";
import { auth, db } from "../firebase/config.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";  
import { Timestamp,doc, setDoc } from "firebase/firestore"; // Use setDoc for correct UID

const SignupPage = () => {
    const [userCredentials, setUserCredentials] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate();  

    function handleChange(e) {
        setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value });
    }

    async function handleSignup(e) {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password);
            const user = userCredential.user;

            console.log("User signed up with UID:", user.uid); 

            // Store user data in Firestore using the correct UID
            await setDoc(doc(db, "users", user.uid), {
                fullName: userCredential.user.displayName || "New User",
                email: userCredential.user.email,
                profilePic: "",
                collegeName: "",
                yearofStudy: "",
                itemsSold:0,
                Rating: 0,
                isVerified: false,
                phone: "",
                wishlist: []
            });

            navigate("/login");  
        } catch (error) {
            console.error("Signup error:", error.message);
            setError(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
                <p className="text-sm text-gray-500 text-center mt-2">Join us today! It takes only a few steps.</p>
                <form onSubmit={handleSignup} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium">Full Name</label>
                        <input onChange={handleChange} name="fullName" placeholder="John Doe" required className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Email</label>
                        <input onChange={handleChange} name="email" type="email" placeholder="johndoe@example.com" required className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Password</label>
                        <input onChange={handleChange} name="password" type="password" placeholder="••••••••" required className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition">Sign Up</button>
                </form>
                {error && <div className="text-red-500 mt-2">{error}</div>}
                <p className="text-center text-gray-600 text-sm mt-4">Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a></p>
            </div>
        </div>
    );
};

export default SignupPage;

