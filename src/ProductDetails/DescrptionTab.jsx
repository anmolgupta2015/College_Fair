import { MapPin, Clock } from "lucide-react"

// Component to render the description tab content
export default function DescriptionTab({ listing }) {
  const description = listing?.description || "No description available."
  const location = listing?.location || "Unknown Location"

  return (
    <div className="space-y-4">
      {/* Product Description */}
      <p className="text-gray-700">{description}</p>

      {/* Metadata (Posted time & Location) */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-primary" />
          Posted recently
        </div>

        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          {location}
        </div>
      </div>
    </div>
  )
}
