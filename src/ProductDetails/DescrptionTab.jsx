"use client"

import { MapPin, Clock, Gift, Calendar, AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Component to render the description tab content
export default function DescriptionTab({ listing }) {
  const description = listing?.description || "No description available."
  const location = listing?.location || "Unknown Location"

  // Format date for display (assuming date strings are provided)
  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Donation Message */}
      {listing.listingType === "donate" && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100 overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-600" />
              <h3 className="font-medium text-emerald-700">Free Donation</h3>
            </div>
            <p className="text-emerald-700 text-sm leading-relaxed">
              This item is being donated for free. The owner wants to give it to someone who needs it.
            </p>

            {listing?.donationReason && (
              <div className="mt-3 pt-3 border-t border-emerald-100">
                <span className="block text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                  Reason for donation
                </span>
                <p className="text-sm text-emerald-800 italic">"{listing.donationReason}"</p>
              </div>
            )}

            {listing?.preferredRecipient && (
              <div className="mt-3 pt-3 border-t border-emerald-100">
                <span className="block text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                  Preferred Recipient
                </span>
                <p className="text-sm text-emerald-800">{listing.preferredRecipient}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rental Information */}
      {listing.listingType === "rent" && (
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100 overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600" />
              <h3 className="font-medium text-sky-700">Available for Rent</h3>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {listing?.availableFrom && (
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs uppercase tracking-wider text-sky-600 font-semibold mb-1">From</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-white text-sky-700 border-sky-200">
                      {formatDate(listing.availableFrom)}
                    </Badge>
                  </div>
                </div>
              )}

              {listing?.availableTo && (
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs uppercase tracking-wider text-sky-600 font-semibold mb-1">To</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-white text-sky-700 border-sky-200">
                      {formatDate(listing.availableTo)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {listing?.damagePolicy && (
              <div className="mt-3 pt-3 border-t border-sky-100 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-sky-600 font-semibold mb-1">
                    Damage Policy
                  </span>
                  <p className="text-sm text-sky-800">{listing.damagePolicy}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Product Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Info className="h-5 w-5 text-gray-500" />
          Description
        </h3>
        <Separator className="bg-gray-200" />
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      {/* Metadata (Posted time & Location) */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>Posted recently</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  )
}
