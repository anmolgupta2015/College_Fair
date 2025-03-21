import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogIn, UserPlus, ShoppingCart, Search, Upload } from "lucide-react";
import { auth } from './firebase/config'; 

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg sticky top-0 w-full z-50 py-4">
      <div className="container mx-auto flex items-center justify-between px-6">
        <NavLink className="text-3xl font-extrabold text-white tracking-wide" to="/">
          CollegeFair
        </NavLink>

    

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => {
            document.getElementById("mobile-menu").classList.toggle("hidden");
          }}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>

        {/* Navigation Links */}
        <div className="hidden lg:flex space-x-8 text-white font-medium">
          <NavLink className="hover:text-yellow-300 transition" to="/">Home</NavLink>
          <NavLink className="hover:text-yellow-300 transition" to="/categories">Explore Categories</NavLink>
          <NavLink className="hover:text-yellow-300 transition" to="/about">About</NavLink>
      
        </div>

        {/* Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <NavLink to="/addItem" className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
            <Upload size={20} /> Wanna Sell?
          </NavLink>
        
          {!auth && (
  <NavLink
    to="/register"
    className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition"
  >
    <UserPlus size={20} /> Register
  </NavLink>
)}


          <NavLink to="/cart" className="relative p-3 text-white rounded-full hover:bg-gray-200 hover:text-purple-700 transition">
            <ShoppingCart size={24} />
          </NavLink>
        </div>
      </div>

      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden lg:hidden flex flex-col items-center space-y-4 py-6 bg-white shadow-lg">
        <NavLink className="hover:text-purple-600 transition" to="/">Home</NavLink>
        <NavLink className="hover:text-purple-600 transition" to="/product">Products</NavLink>
        <NavLink className="hover:text-purple-600 transition" to="/about">About</NavLink>
        <NavLink className="hover:text-purple-600 transition" to="/contact">Contact</NavLink>
        <NavLink to="/addItem" className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
          <Upload size={20} /> Wanna Sell?
        </NavLink>
      
        <NavLink to="/cart" className="relative p-3 text-purple-700 rounded-full hover:bg-gray-200 transition">
          <ShoppingCart size={24} />
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
