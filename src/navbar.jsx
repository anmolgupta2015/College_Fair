"use client"

import { useState, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { ShoppingBag, Store, Menu, X, User, ChevronDown } from "lucide-react"
import { auth } from "./firebase/config"
import { signOut } from "firebase/auth"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink
              className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center"
              to="/"
              aria-label="CollegeFair Home"
            >
              <span className="text-purple-600">College</span>
              <span className="text-gray-800">Fair</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-10">
            <div className="flex space-x-1">
              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                  }`
                }
                to="/"
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                  }`
                }
                to="/categories"
              >
                Categories
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                  }`
                }
                to="/about"
              >
                About
              </NavLink>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <NavLink
                to="/addItem"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
                aria-label="Sell an item"
              >
                <Store size={15} /> Sell Item
              </NavLink>

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 rounded hover:bg-gray-50 transition-colors duration-200"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <User size={15} />
                    <span className="text-sm font-medium">Account</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-md py-1 z-50 border border-gray-100">
                      <NavLink
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Profile
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Orders
                      </NavLink>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200"
                    aria-label="Sign in"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Register"
                  >
                    Register
                  </NavLink>
                </div>
              )}

              <NavLink
                to="/cart"
                className="relative p-1.5 text-gray-700 rounded hover:bg-gray-50 transition-colors duration-200"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={18} />
                {/* Only show the badge if there are items */}
                <span className="absolute -top-1 -right-1 bg-purple-600 text-xs text-white font-medium rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </NavLink>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            {currentUser && (
              <NavLink to="/profile" className="p-1.5 text-gray-700 rounded hover:bg-gray-50" aria-label="Your profile">
                <User size={18} />
              </NavLink>
            )}

            <NavLink
              to="/cart"
              className="relative p-1.5 text-gray-700 rounded hover:bg-gray-50"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={18} />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-xs text-white font-medium rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </NavLink>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-gray-700 rounded hover:bg-gray-50 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/categories"
            >
              Categories
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/about"
            >
              About
            </NavLink>
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            {currentUser ? (
              <div className="space-y-1">
                <NavLink
                  to="/profile"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  Your Profile
                </NavLink>
                <NavLink
                  to="/orders"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  Your Orders
                </NavLink>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <NavLink
                  to="/login"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="block px-3 py-2 rounded text-base font-medium text-white bg-gray-800 hover:bg-gray-700"
                >
                  Register
                </NavLink>
              </div>
            )}

            <NavLink
              to="/addItem"
              className="mt-3 block w-full px-3 py-2 rounded text-center text-base font-medium bg-purple-600 text-white hover:bg-purple-700"
            >
              <Store size={15} className="inline-block mr-2" /> Sell Your Items
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
