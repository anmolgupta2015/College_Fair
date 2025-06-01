"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import {
  ArrowLeft,
  Clock,
  Gift,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import SellerDetails from "./SellerDetailsTab"
import DescriptionTab from "./DescrptionTab"
import DetailsTab from "./DetailsTab"
import RightColumn from "./RightColumn"
import RentalOptions from "../rentaloption"
import { useParams, useNavigate } from "react-router-dom"

/**
 * Enhanced Image Viewer Component
 * Features:
 * - Full image display without cropping
 * - Zoom and pan functionality
 * - Touch gestures for mobile
 * - Keyboard navigation
 * - Auto-hiding controls
 * - Responsive design
 */
function ImageViewer({ images, initialIndex = 0, isOpen, onClose }) {
  // ==================== STATE MANAGEMENT ====================

  // Current image index in the array
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Zoom level (1 = original size, >1 = zoomed in, <1 = zoomed out)
  const [scale, setScale] = useState(1)

  // Image position for panning when zoomed
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Drag state for pan functionality
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Refs for DOM elements
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // ==================== INITIALIZATION EFFECTS ====================

  /**
   * Reset viewer state when dialog opens/closes or image changes
   */
  useEffect(() => {
    if (isOpen) {
      // Reset all states to default
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setCurrentIndex(initialIndex)
      setIsLoading(true)
      setShowControls(true)

      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden"
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scrolling
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, initialIndex])

  /**
   * Reset zoom and position when switching images
   */
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
    setImageDimensions({ width: 0, height: 0 })
  }, [currentIndex])

  // ==================== AUTO-HIDE CONTROLS ====================

  /**
   * Auto-hide controls after 3 seconds of inactivity
   */
  useEffect(() => {
    if (showControls) {
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => clearTimeout(controlsTimeoutRef.current)
  }, [showControls])

  /**
   * Show controls temporarily and reset auto-hide timer
   */
  const showControlsTemporarily = () => {
    setShowControls(true)
  }

  // ==================== IMAGE SIZING CALCULATIONS ====================

  /**
   * Calculate optimal image size to fit container while maintaining aspect ratio
   * Ensures the full image is always visible without cropping
   */
  const calculateImageSize = (imgWidth, imgHeight, containerWidth, containerHeight) => {
    // Calculate aspect ratios
    const imageAspectRatio = imgWidth / imgHeight
    const containerAspectRatio = containerWidth / containerHeight

    let displayWidth, displayHeight

    // Fit image to container while maintaining aspect ratio
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container ratio - fit to width
      displayWidth = containerWidth * 0.9 // 90% of container width for padding
      displayHeight = displayWidth / imageAspectRatio
    } else {
      // Image is taller than container ratio - fit to height
      displayHeight = containerHeight * 0.9 // 90% of container height for padding
      displayWidth = displayHeight * imageAspectRatio
    }

    return { width: displayWidth, height: displayHeight }
  }

  /**
   * Handle image load to get dimensions and calculate optimal size
   */
  const handleImageLoad = (event) => {
    const img = event.target
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    // Get container dimensions
    const container = containerRef.current
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height

      // Calculate optimal display size
      const optimalSize = calculateImageSize(naturalWidth, naturalHeight, containerWidth, containerHeight)

      setImageDimensions(optimalSize)
    }

    setIsLoading(false)
  }

  // ==================== ZOOM FUNCTIONALITY ====================

  /**
   * Zoom in with smooth scaling and boundary checks
   */
  const zoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(prev * 1.4, 4) // Max zoom: 400%
      return newScale
    })
    showControlsTemporarily()
  }

  /**
   * Zoom out with smooth scaling and position reset
   */
  const zoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.4, 0.3) // Min zoom: 30%

      // Reset position when zooming out to fit
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 })
      }

      return newScale
    })
    showControlsTemporarily()
  }

  /**
   * Reset zoom to original size and center position
   */
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    showControlsTemporarily()
  }

  // ==================== NAVIGATION FUNCTIONALITY ====================

  /**
   * Navigate to previous image with wraparound
   */
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    showControlsTemporarily()
  }

  /**
   * Navigate to next image with wraparound
   */
  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    showControlsTemporarily()
  }

  // ==================== DRAG/PAN FUNCTIONALITY ====================

  /**
   * Calculate maximum pan boundaries based on zoom level and image size
   */
  const calculatePanBoundaries = () => {
    if (scale <= 1) return { maxX: 0, maxY: 0 }

    const container = containerRef.current
    if (!container) return { maxX: 0, maxY: 0 }

    const containerRect = container.getBoundingClientRect()
    const scaledWidth = imageDimensions.width * scale
    const scaledHeight = imageDimensions.height * scale

    // Calculate how much the image extends beyond the container
    const overflowX = Math.max(0, (scaledWidth - containerRect.width) / 2)
    const overflowY = Math.max(0, (scaledHeight - containerRect.height) / 2)

    return {
      maxX: overflowX,
      maxY: overflowY,
    }
  }

  /**
   * Handle mouse down for drag start
   */
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
      e.preventDefault()
    }
  }

  /**
   * Handle mouse move for dragging with boundary constraints
   */
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      // Apply boundary constraints
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  /**
   * Handle mouse up to end dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // ==================== TOUCH FUNCTIONALITY ====================

  /**
   * Handle touch start for mobile drag
   */
  const handleTouchStart = (e) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
    showControlsTemporarily()
  }

  /**
   * Handle touch move for mobile drag with boundary constraints
   */
  const handleTouchMove = (e) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault()

      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y

      // Apply boundary constraints
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  /**
   * Handle touch end to stop dragging
   */
  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  /**
   * Handle double tap/click to toggle zoom
   */
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2) // Zoom to 200%
    } else {
      resetZoom() // Reset to original size
    }
  }

  // ==================== KEYBOARD SHORTCUTS ====================

  /**
   * Handle keyboard shortcuts for navigation and zoom
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case "+":
        case "=":
          zoomIn()
          break
        case "-":
          zoomOut()
          break
        case "0":
          resetZoom()
          break
        case " ":
          e.preventDefault()
          showControlsTemporarily()
          break
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isOpen, isDragging, dragStart, scale])

  // ==================== RENDER GUARDS ====================

  if (!images || images.length === 0) return null

  // ==================== COMPONENT RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black border-0 overflow-hidden">
        <div
          className="relative w-full h-full flex flex-col"
          onMouseMove={showControlsTemporarily}
          onTouchStart={showControlsTemporarily}
        >
          {/* ==================== HEADER CONTROLS ==================== */}
          <div
            className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-all duration-500 ${
              showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between p-3 sm:p-6">
              {/* Image counter */}
              <div className="flex items-center gap-3 text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                  {currentIndex + 1} of {images.length}
                </div>
              </div>

              {/* Zoom and close controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Desktop zoom controls */}
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <span className="text-white text-sm min-w-[50px] text-center font-medium">
                    {Math.round(scale * 100)}%
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile zoom controls */}
                <div className="flex sm:hidden items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-white text-xs min-w-[35px] text-center">{Math.round(scale * 100)}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* ==================== MAIN IMAGE CONTAINER ==================== */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center overflow-hidden relative"
            style={{
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              background: "radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)",
            }}
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Main image with full display and no cropping */}
            <img
              ref={imageRef}
              src={images[currentIndex] || "/placeholder.svg?height=800&width=1200"}
              alt={`Image ${currentIndex + 1}`}
              className={`transition-all duration-300 ease-out select-none ${isLoading ? "opacity-0" : "opacity-100"}`}
              style={{
                // Ensure full image is displayed without cropping
                width: scale === 1 ? `${imageDimensions.width}px` : "auto",
                height: scale === 1 ? `${imageDimensions.height}px` : "auto",
                maxWidth: scale === 1 ? "90vw" : "none",
                maxHeight: scale === 1 ? "90vh" : "none",
                objectFit: "contain", // Ensures full image is visible
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              onLoad={handleImageLoad}
              draggable={false}
            />
          </div>

          {/* ==================== NAVIGATION ARROWS ==================== */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full h-10 w-10 sm:h-14 sm:w-14 p-0 transition-all duration-500 ${
                  showControls ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
                }`}
              >
                <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full h-10 w-10 sm:h-14 sm:w-14 p-0 transition-all duration-500 ${
                  showControls ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
                <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8" />
              </Button>
            </>
          )}

          {/* ==================== THUMBNAIL NAVIGATION ==================== */}
          {images.length > 1 && (
            <div
              className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${
                showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
              }`}
            >
              <div className="p-3 sm:p-6">
                <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto max-w-full scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentIndex
                          ? "border-white scale-110 shadow-lg shadow-white/25"
                          : "border-white/30 hover:border-white/70 hover:scale-105"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg?height=64&width=64"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== USAGE INSTRUCTIONS ==================== */}
          <div
            className={`absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-white/80 text-xs sm:text-sm text-center px-4 transition-all duration-500 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 sm:hidden">
              <p>Double tap to zoom • Pinch to zoom • Drag to pan</p>
            </div>
            <div className="hidden sm:block bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <p>Double click to zoom • Scroll to zoom • Drag to pan • Arrow keys to navigate</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Main Listing Page Component
 * Displays product details with enhanced image viewer
 */
export default function ListingPage() {
  // ==================== STATE MANAGEMENT ====================

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [purchaseType, setPurchaseType] = useState("buy")
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  // ==================== ROUTING ====================

  const { productId } = useParams()
  const navigate = useNavigate()

  // ==================== DATA FETCHING ====================

  /**
   * Fetch product data from Firestore
   */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const productRef = doc(db, "items", productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const productData = productSnap.data()
          setListing(productData)

          // Set default purchase type for donations
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

  /**
   * Set default selected image when listing loads
   */
  useEffect(() => {
    if (listing?.images?.length > 0) {
      setSelectedImage(listing.images[0])
      setSelectedImageIndex(0)
    }
  }, [listing])

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle thumbnail image click
   */
  const handleImageClick = (image, index) => {
    setSelectedImage(image)
    setSelectedImageIndex(index)
  }

  /**
   * Handle main image click to open viewer
   */
  const handleMainImageClick = () => {
    setIsImageViewerOpen(true)
  }

  // ==================== LOADING STATES ====================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500">Product not found!</p>
      </div>
    )
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
          {/* Back navigation */}
          <Link
            to="/itemlist"
            className="inline-flex items-center text-sm mb-4 sm:mb-6 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>

          {/* Status badges */}
          <div className="mb-4 sm:mb-6">
            {listing.listingType == "donate" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2">
                <Gift className="h-4 w-4 mr-1" />
                Free Donation
              </span>
            )}
            {listing.listingType == "rent" && listing.lisitngType != "donate" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Clock className="h-4 w-4 mr-1" />
                Available for Rent
              </span>
            )}
          </div>

          {/* Main content grid - Maintaining original order on all screen sizes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left column: Images and tabs - Always first in order */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Image section */}
              <div className="space-y-3 sm:space-y-4">
                {/* Main image with click to zoom */}
                <div className="relative group">
                  <div
                    className="aspect-video overflow-hidden rounded-xl border-2 border-blue-200 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-400"
                    onClick={handleMainImageClick}
                  >
                    <img
                      src={selectedImage || "/images/sample-image.png"}
                      alt={listing?.title || "Product"}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Zoom overlay hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="h-4 w-4" />
                        <span className="text-sm font-medium">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {listing?.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedImage === image
                          ? "ring-2 ring-blue-500 ring-offset-2 scale-105 border-blue-400 shadow-lg"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                      onClick={() => handleImageClick(image, index)}
                    >
                      <img
                        src={image || "/placeholder.svg?height=100&width=100"}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rental options */}
              {listing.listingType === "rent" && listing.lisitngType !== "donate" && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex space-x-4 mb-4">
                    {listing.lisitngType === "rent" && (
                      <button
                        className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 bg-purple-600 text-white shadow-lg hover:shadow-xl hover:bg-purple-700"
                        onClick={() => setPurchaseType("rent")}
                      >
                        Rent
                      </button>
                    )}
                  </div>

                  {listing.listingType === "rent" && <RentalOptions listing={listing} />}
                </div>
              )}

              {/* Information tabs */}
              <div>
                <Tabs
                  defaultValue="description"
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-lg p-1">
                    <TabsTrigger
                      value="description"
                      className="text-xs sm:text-sm py-2 sm:py-3 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="text-xs sm:text-sm py-2 sm:py-3 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="seller"
                      className="text-xs sm:text-sm py-2 sm:py-3 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Seller
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="pt-4 sm:pt-6">
                    <DescriptionTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="details" className="pt-4 sm:pt-6">
                    <DetailsTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="seller" className="pt-4 sm:pt-6">
                    <SellerDetails listing={listing} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right column: Price and actions - Always maintains the same order */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <RightColumn listing={listing} purchaseType={purchaseType} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Image Viewer Modal */}
      <ImageViewer
        images={listing?.images || []}
        initialIndex={selectedImageIndex}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </div>
  )
}
