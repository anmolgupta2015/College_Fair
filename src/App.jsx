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
import ProductDetails from './ProductDetails/ProductDetails';
import Categories from './home/categories';
import RentalOption from './rentaloption';
import ButtonClick from '../src/buttonClick'
import AboutUs from "./about"
import PreviousPaper from "./PreviousPaper/previousPaperUpload"
import PreviousPaperComponent from './PreviousPaper/PreviousPaper'
import Paper from './PreviousPaper/paper'



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
        <Route path="/itemlist/product/:productId" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile/:RouteuserId" element={<ProfilePage MyProfile = "false" />} />
        <Route path="/about" element={<AboutUs />} />
        {/* Protected Routes */}
        <Route path="/" element={<ItemList />} />
         <Route path="/itemlist" element={<ItemList />}  />
         <Route path="/itemlist/:categoryRoute"  element={<ItemList />}/>
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage MyProfile = "true" />} />} />
        <Route path="/rental" element={<RentalOption />} />
        <Route path="/button" element={<ButtonClick />}  />
        <Route path="/paper" element={<PreviousPaper />}  />
        <Route path="/papercomp" element={<PreviousPaperComponent />}  />
        <Route path="/papercomp/:paperId"  element={<Paper />}/>
        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

