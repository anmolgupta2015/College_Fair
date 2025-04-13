"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../src/firebase/config"
import { Search, Sliders, Heart, ShoppingCart, Clock, Gift } from "lucide-react"
import Navbar from "./navbar"
import { useParams, useNavigate } from "react-router-dom"

export default function ProductListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [products, setProducts] = useState([]) // Stores product data
  const [userMap, setUserMap] = useState({}) // Maps userId -> name
  const [loading, setLoading] = useState(true)

  const { categoryRoute } = useParams()
  console.log(categoryRoute)
  useEffect(() => {
    if (categoryRoute) {
      console.log(categoryRoute)
      setCategoryFilter(categoryRoute)
    } else {
      setCategoryFilter("All")
    }
  }, [categoryRoute])

  const navigate = useNavigate()

  const handleCategoryChange = (e) => {
    const selected = e.target.value
    if (selected === "All") {
      navigate("/itemlist")
    } else {
      navigate(`/itemlist/${selected}`)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"))
        const fetchedProducts = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            userId: data.userId || "unknownUser", // Fallback if userId is missing
          }
        })

        // Get unique userIds to fetch, filtering out undefined or null
        const userIds = [
          ...new Set(
            fetchedProducts
              .map((product) => product.userId)
              .filter((userId) => userId !== undefined && userId !== null && userId !== "unknownUser"),
          ),
        ]

        console.log("User IDs to fetch:", userIds) // Debug to check userIds

        await fetchUsers(userIds) // Fetch corresponding user names

        setProducts(fetchedProducts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    // Fetch user names based on userId and map them
    const fetchUsers = async (userIds) => {
      const userMapTemp = {}
      for (const userId of userIds) {
        if (!userId || userId === "unknownUser") continue // Skip invalid userIds

        try {
          const userDoc = await getDoc(doc(db, "users", userId))
          if (userDoc.exists()) {
            userMapTemp[userId] = userDoc.data().fullName
          } else {
            userMapTemp[userId] = "Unknown" // Fallback if user not found
          }
        } catch (error) {
          console.error(`Error fetching user for ID ${userId}:`, error)
          userMapTemp[userId] = "Unknown"
        }
      }
      setUserMap(userMapTemp)
    }

    fetchProducts()
  }, [])

  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map((product) => product.category))]

  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <p className="text-center mt-12 text-lg">Loading products...</p>
  }

  if (selectedProductId !== null) {
    navigate(`/itemlist/product/${selectedProductId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-gray-400" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                handleCategoryChange(e)
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300 ${
                  product.isRentable ? "border-2 border-purple-400" : ""
                } ${product.isDonation ? "border-2 border-green-400" : ""}`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100">
                    <Heart className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  </button>
                  {true && !product.isDonation && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Available for Rent
                    </div>
                  )}
                  {product.isDonation && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      <Gift className="h-3 w-3 inline mr-1" />
                      Free Donation
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{product.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    {product.isDonation ? (
                      <p className="text-xl font-bold text-green-600">Free</p>
                    ) : (
                      <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
                    )}
                    {product.isRentable && !product.isDonation && (
                      <div className="flex items-center text-purple-600 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1" />₹{product.rentalPrice || Math.round(product.price * 0.1)}/day
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Seller: {userMap[product.userId] || "Loading..."}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {product.condition}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      {false ? (
                        <>
                          <Gift className="h-4 w-4 mr-1" />
                          Request Item
                        </>
                      ) : product.isRentable ? (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          View Options
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <p className="text-gray-400">Try adjusting your search or filter.</p>
          </div>
        )}
      </main>
    </div>
  )
}
