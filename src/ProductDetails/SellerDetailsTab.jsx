import { db } from "../firebase/config"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Star} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"



// This component is used to display seller details at productDetails Page

export default function SellerDetails({listing}){
  const navigate  = useNavigate();
 console.log(listing);

const [seller, setSeller] = useState(null);
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


  const sellerDetails = {
    name: seller?.fullName || "Unknown Seller",
    avatar: seller?.profileImage || "/placeholder.svg",
    rating: seller?.Rating || 0,
    memberSince: seller?.createdAt || "Unknown",
    responseRate: seller?.email || "Unknown",
    responseTime: seller?.phone || "Unknown",
  }

  function handleClick(){
    if(listing?.userId && listing.userId!==null){
      navigate(`/profile/${listing.userId}`);
    }
  
  };

return (
       <>
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
       <Button className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-md transition-all duration-200" onClick={handleClick}>
        
         View Profile
       </Button>
     </div>
     </div>
   
   </>
)
};