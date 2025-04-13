"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { ArrowLeft, Clock, Gift } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SellerDetails from "./SellerDetailsTab"
import DescriptionTab from "./DescrptionTab"
import DetailsTab from "./DetailsTab"
import RightColumn from "./RightColumn"
import RentalOptions from "../rentaloption"
import { useParams, useNavigate } from "react-router-dom"

export default function ListingPage() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [purchaseType, setPurchaseType] = useState("buy") // "buy", "rent", or "donate"

  // Fetch product from Firestore
  const { productId } = useParams()
  const navigate = useNavigate()
  console.log(productId)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const productRef = doc(db, "items", productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const productData = productSnap.data()
          setListing(productData)

          // If it's a donation item, set the purchase type to "donate" by default
          if (productData.isDonation) {
            setPurchaseType("donate")
          }
        } else {
          console.error("No such product found!")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Set default selected image after product is loaded
  useEffect(() => {
    if (listing?.images?.length > 0) {
      setSelectedImage(listing.images[0])
    }
  }, [listing])

  const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  // UI States
  if (loading) {
    return <p className="text-center mt-12 text-lg">Loading product details...</p>
  }

  if (!listing) {
    return <p className="text-center mt-12 text-lg text-red-500">Product not found!</p>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          {/* Back to Browse */}
          <Link to="/itemlist" className="inline-flex items-center text-sm mb-6 text-gray-500 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>

          {/* Item Status Badge */}
          <div className="mb-4">
            {true && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2">
                <Gift className="h-4 w-4 mr-1" />
                Free Donation
              </span>
            )}
            {true && false && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Clock className="h-4 w-4 mr-1" />
                Available for Rent
              </span>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Images & Tabs */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Viewer */}
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-xl border-2 border-indigo-500 shadow-md">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt={listing?.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-2">
                  {listing?.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square overflow-hidden rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedImage === image ? "ring-2 ring-indigo-500 scale-110" : ""
                      }`}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Type Selector (only for rentable items that are not donations) */}
              {true && !listing.isDonation && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex space-x-4 mb-4">
                    <button
                      className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        purchaseType === "buy"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setPurchaseType("buy")}
                    >
                      Buy
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        purchaseType === "rent"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setPurchaseType("rent")}
                    >
                      Rent
                    </button>
                  </div>

                  {purchaseType === "rent" && <RentalOptions listing={listing} />}
                </div>
              )}

              {/* Tabs: Description / Details / Seller */}
              <div>
                <Tabs defaultValue="description" className="bg-white p-4 rounded-lg shadow">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="seller">Seller</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="pt-4">
                    <DescriptionTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="details" className="pt-4">
                    <DetailsTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="seller" className="pt-4">
                    <SellerDetails listing={listing} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column: Price & Actions */}
            <RightColumn listing={listing} purchaseType={purchaseType} />
          </div>
        </div>
      </main>
    </div>
  )
}
