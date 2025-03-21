import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../src/firebase/config"
import {
  Star,
  MapPin,
  Clock,
  Heart,
  Share,
  Flag,
  ArrowLeft,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ListingPage({ productId }) {
  // State to store product details
  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage,setselectedImage] = useState(null);


  function handleImageClick(image){
    setselectedImage(image);
  }

  // Fetch product from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const productRef = doc(db, "items", productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          setListing(productSnap.data())
          setselectedImage(listing?.image[0])
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

  // Fetch seller details from Firestore
  useEffect(() => {
    const fetchSeller = async () => {
      if (!listing?.userId) return

      try {
        const userRef = doc(db, "users", listing.userId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setSeller(userSnap.data())
        } else {
          console.error("No such seller found!")
        }
      } catch (error) {
        console.error("Error fetching seller info:", error)
      }
    }

    if (listing?.userId) {
      fetchSeller()
    }
  }, [listing?.userId])


  useEffect(() => {
    if (listing?.images?.length > 0) {
      setselectedImage(listing.images[0]);
    }
  }, [listing]);

  // Handle loading state
  if (loading) {
    return <p className="text-center mt-12 text-lg">Loading product details...</p>
  }

  // Handle case when product is not found
  if (!listing) {
    return <p className="text-center mt-12 text-lg text-red-500">Product not found!</p>
  }

  // Default seller values
  const sellerDetails = {
    name: seller?.fullName || "Unknown Seller",
    avatar: seller?.profileImage || "/placeholder.svg",
    rating: seller?.Rating || 0,
    memberSince: seller?.createdAt || "Unknown",
    responseRate: seller?.email || "Unknown",
    responseTime: seller?.phone || "Unknown",
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          {/* Back Button */}
          <Link
            to="/browse"
            className="inline-flex items-center text-sm mb-6 text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
          
      {/* Enlarged Selected Image */}
      <div className="aspect-video overflow-hidden rounded-xl border-2 border-indigo-500 shadow-md transition-all duration-200">
        <img
          src={selectedImage}
          alt={listing?.title || "Product"}
          width={800}
          height={450}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Grid */}
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
              alt={`${listing?.title || "Product"} - Image ${index + 1}`}
              width={120}
              height={120}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
  

                
                </div>
              </div>

              {/* Listing Details */}
              <div>
                <Tabs defaultValue="description" className="bg-white p-4 rounded-lg shadow">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="seller">Seller</TabsTrigger>
                  </TabsList>

                  {/* Description Tab */}
                  <TabsContent value="description" className="pt-4">
                    <p className="text-gray-700">{listing?.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        Posted recently
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        {listing?.location || "Unknown Location"}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="pt-4">
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(listing?.details || {}).map(([key, value], index) => (
      <div
        key={index}
        className="flex flex-col p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white"
      >
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {key}
        </span>
        <span className="text-base font-medium text-gray-900 mt-1">{value}</span>
      </div>
    ))}
  </div>
</TabsContent>

                  {/* Seller Tab */}
                  <TabsContent value="seller" className="pt-4">
  <div className="flex items-start gap-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
    {/* Seller Avatar */}
    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
      <img
        src={sellerDetails.avatar || "/placeholder.svg"}
        alt={sellerDetails.name || "Seller"}
        className="object-cover w-full h-full"
      />
    </div>

    {/* Seller Information */}
    <div className="flex-1">
      {/* Seller Name and Rating */}
      <h3 className="text-xl font-semibold text-gray-900">{sellerDetails.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(sellerDetails.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm ml-1 text-gray-600">
          {sellerDetails.rating?.toFixed(1) || "N/A"}
        </span>
      </div>

      {/* Additional Details Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-medium">Member since</p>
          <p className="text-gray-900 font-semibold">
            {sellerDetails.createdAt || "N/A"}
          </p>
        </div>
        <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-medium">E-Mail</p>
          <p className="text-gray-900 font-semibold">
            {sellerDetails.responseRate || "N/A"}
          </p>
        </div>
        <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-medium">Phone Number</p>
          <p className="text-gray-900 font-semibold">
            {sellerDetails.responseTime || "N/A"}
          </p>
        </div>
      </div>

      {/* Contact Button */}
      <Button className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-md transition-all duration-200">
       
        View Profile
      </Button>
    </div>
  </div>
</TabsContent>

                </Tabs>
              </div>
            </div>

            {/* Sidebar with Price and Actions */}
            <div>
              <div className="sticky top-20 rounded-lg border bg-white p-6 shadow-lg">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900">{listing?.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-700">{listing?.category}</Badge>
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300"
                    >
                      {listing?.condition}
                    </Badge>
                  </div>

                  <div className="text-3xl font-extrabold text-indigo-600">
                  ₹{listing?.price || 0}
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <Button
                      size="lg"
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Contact Seller
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full text-gray-700 hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      Add to Wishlist
                    </Button>
                  </div>

                  <div className="flex justify-between text-sm pt-4 border-t">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-500">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-500 hover:bg-red-50"
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
