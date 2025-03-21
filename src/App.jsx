import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from './firebase/config'; // Import Firebase auth
import SignupPage from './authentication/signup';
import LoginPage from './authentication/login';
import ProfilePage from './profile';
import MainPage from './mainPage';
import Item from './item';
import ItemList from './itemslist';
import AddItem from './addItem';
import ProductDetails from './ProductDetails';
import Categories from './home/categories';




const ProtectedRoute = ({ element }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return user ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/addItem" element={<AddItem />} />
        <Route path="/productDetails" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute element={<MainPage />} />} />
         <Route path="/itemlist" element={<ProtectedRoute element={<ItemList />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

