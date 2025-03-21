import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../src/firebase/config'; // Ensure correct Firebase config import
import { signOut } from 'firebase/auth';

const MainPage = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Redirect to login after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold">Welcome to the Main Page</h1>

                <button 
                    onClick={() => navigate('/profile')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Profile
                </button>

                <button 
                    onClick={handleLogout}
                    className="mt-4 ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MainPage;

