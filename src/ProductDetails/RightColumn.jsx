"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Flag, Clock, Gift } from "lucide-react"
import ShareButton from "./sharebutton"

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
            {true && !listing?.isDonation && (
              <Badge className="bg-purple-100 text-purple-700">
                <Clock className="h-3 w-3 mr-1" />
                Rentable
              </Badge>
            )}
            {listing?.isDonation && (
              <Badge className="bg-green-100 text-green-700">
                <Gift className="h-3 w-3 mr-1" />
                Free
              </Badge>
            )}
          </div>

          {/* Price */}
          {effectivePurchaseType === "donate" ? (
            <div className="text-3xl font-extrabold text-green-600">Free</div>
          ) : effectivePurchaseType === "rent" ? (
            <div className="text-3xl font-extrabold text-purple-600">
              ₹{listing?.rentalPrice || Math.round((listing?.price || 0) * 0.1)}/day
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-indigo-600">₹{listing?.price || 0}</div>
          )}

          {/* Donation Message */}
          {listing?.isDonation && (
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800 text-sm">
                This item is being donated for free. The owner wants to give it to someone who needs it.
                {listing?.donationReason && (
                  <>
                    <br />
                    <br />
                    <span className="font-medium">Reason for donation:</span>
                    <br />
                    {listing.donationReason}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              className={`w-full text-white ${
                effectivePurchaseType === "donate"
                  ? "bg-green-600 hover:bg-green-700"
                  : effectivePurchaseType === "rent"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {false ? (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Request Item
                </>
              ) : effectivePurchaseType === "rent" ? (
                "Rent Now"
              ) : (
                "Contact Seller"
              )}
            </Button>
            {true && (
              <Button size="lg" variant="outline" className="w-full text-gray-700 hover:bg-gray-100">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                Add to Wishlist
              </Button>
            )}
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
