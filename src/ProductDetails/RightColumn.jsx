"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Flag, Clock, Gift } from "lucide-react"
import ShareButton from "./sharebutton"
import BuyButton from '../buttonClick'

export default function RightColumn({ listing, purchaseType = "buy" }) {
  // If the item is a donation, force the purchase type to "donate"
  const effectivePurchaseType = listing?.isDonation ? "donate" : purchaseType

  return (
    <>
      <div>
        <div className="sticky top-20 rounded-lg border bg-white p-6 shadow-lg space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{listing?.title}</h1>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-700">{listing?.category}</Badge>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              {listing?.condition}
            </Badge>
            {listing.listingType == "rent" && listing.listingType != "donate" && (
              <Badge className="bg-purple-100 text-purple-700">
                <Clock className="h-3 w-3 mr-1" />
                Rentable
              </Badge>
            )}
            {listing.listingType === "donate" && (
              <Badge className="bg-green-100 text-green-700">
                <Gift className="h-3 w-3 mr-1" />
                Free
              </Badge>
            )}
          </div>

          {/* Price */}
          {listing.listingType === "donate" ? (
            <div className="text-3xl font-extrabold text-green-600">Free</div>
          ) : listing.listingType != "donate" && listing.listingType === "rent" ? (
            <div className="text-3xl font-extrabold text-purple-600">
              ₹{listing?.rentAmount || Math.round((listing?.price || 0) * 0.1)}/day
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-indigo-600">₹{listing?.price || 0}</div>
          )}


          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
          <BuyButton listing = {listing}/>
           
              
            
          </div>

          {/* Share & Report */}
          <div className="flex justify-between text-sm pt-4 border-t">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-500">
              <ShareButton collegeName="PEC" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:bg-red-50">
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
