"use client"

import { useState, useEffect, useRef } from "react"
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function ImageViewer({ images = [], initialIndex = 0, isOpen = false, onClose = () => {} }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  // Check if fullscreen is supported
  const isFullscreenSupported =
    typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled)

  // Initialize and reset states
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setCurrentIndex(initialIndex)
      setIsLoading(true)
      document.body.style.overflow = "hidden"

      // Update container size
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    } else {
      document.body.style.overflow = "unset"
      // Exit fullscreen when closing viewer
      if (isFullscreen) {
        exitFullscreen()
      }
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, initialIndex])

  // Reset when switching images
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
  }, [currentIndex])

  // Update container size on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = async () => {
    if (!isFullscreenSupported || !viewerRef.current) return

    try {
      if (viewerRef.current.requestFullscreen) {
        await viewerRef.current.requestFullscreen()
      } else if (viewerRef.current.webkitRequestFullscreen) {
        await viewerRef.current.webkitRequestFullscreen()
      } else if (viewerRef.current.mozRequestFullScreen) {
        await viewerRef.current.mozRequestFullScreen()
      } else if (viewerRef.current.msRequestFullscreen) {
        await viewerRef.current.msRequestFullscreen()
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    } catch (error) {
      console.error("Error exiting fullscreen:", error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  const handleImageLoad = (event) => {
    const img = event.target
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    // Get actual container dimensions
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const availableWidth = containerRect.width - 60 // Leave padding for controls
    const availableHeight = containerRect.height - 120 // Leave space for top/bottom controls

    // Calculate scale to fit entire image within container
    const scaleX = availableWidth / naturalWidth
    const scaleY = availableHeight / naturalHeight
    const fitScale = Math.min(scaleX, scaleY) // Use the smaller scale to ensure full image fits

    // Set the display size to show the complete image
    const displayWidth = naturalWidth * fitScale
    const displayHeight = naturalHeight * fitScale

    setImageSize({ width: displayWidth, height: displayHeight })
    setIsLoading(false)
  }

  // Gentler zoom increments
  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.15, 4)) // Reduced from 1.3 to 1.15
  }

  const zoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.15, 0.3) // Reduced from 1.3 to 1.15
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newScale
    })
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const fitToScreen = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      resetZoom()
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const calculatePanBoundaries = () => {
    if (scale <= 1) return { maxX: 0, maxY: 0 }

    const scaledWidth = imageSize.width * scale
    const scaledHeight = imageSize.height * scale
    const containerWidth = containerSize.width || window.innerWidth
    const containerHeight = containerSize.height || window.innerHeight

    const overflowX = Math.max(0, (scaledWidth - containerWidth) / 2)
    const overflowY = Math.max(0, (scaledHeight - containerHeight) / 2)

    return { maxX: overflowX, maxY: overflowY }
  }

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

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault()
      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            exitFullscreen()
          } else {
            onClose()
          }
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
        case "f":
        case "F":
          toggleFullscreen()
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
  }, [isOpen, isDragging, dragStart, scale, images.length, isFullscreen])

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-0 overflow-hidden">
        <div ref={viewerRef} className={`relative w-full h-full ${isFullscreen ? "bg-black" : ""}`}>
          {/* TOP CONTROLS BAR - Always visible */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
              {/* Left side - Image counter and info */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-4 py-2 text-white font-semibold border border-white/20 shadow-lg">
                  <span className="text-sm sm:text-base">
                    {currentIndex + 1} of {images.length}
                  </span>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Desktop zoom controls */}
                <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full px-3 py-2 border border-white/20 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 hover:scale-110 h-9 w-9 p-0 rounded-full transition-all duration-200"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-white text-sm min-w-[55px] text-center font-semibold px-2">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 hover:scale-110 h-9 w-9 p-0 rounded-full transition-all duration-200"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-white/20 mx-1"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="text-white hover:bg-white/20 hover:scale-110 h-9 w-9 p-0 rounded-full transition-all duration-200"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  {/* Fullscreen button */}
                  {isFullscreenSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 hover:scale-110 h-9 w-9 p-0 rounded-full transition-all duration-200"
                      title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                {/* Mobile zoom controls */}
                <div className="flex sm:hidden items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full px-3 py-2 border border-white/20 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full transition-all duration-200"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-white text-sm min-w-[45px] text-center font-semibold">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full transition-all duration-200"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {/* Mobile fullscreen button */}
                  {isFullscreenSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full transition-all duration-200"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-red-500/20 hover:scale-110 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md rounded-full h-10 w-10 sm:h-11 sm:w-11 p-0 border border-red-500/30 shadow-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* MAIN IMAGE CONTAINER */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              paddingTop: "80px",
              paddingBottom: images.length > 1 ? "100px" : "20px",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse"></div>
                </div>
              </div>
            )}

            {/* Image */}
            <img
              ref={imageRef}
              src={currentImage || "/placeholder.svg?height=800&width=1200"}
              alt={`Image ${currentIndex + 1}`}
              className={`select-none transition-all duration-500 ease-out rounded-lg shadow-2xl ${
                isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: "center center",
                filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
                border: "1px solid rgba(255,255,255,0.1)",
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

          {/* NAVIGATION ARROWS - Always visible */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:scale-110 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full h-14 w-14 sm:h-16 sm:w-16 p-0 border border-white/20 shadow-xl transition-all duration-300"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:scale-110 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full h-14 w-14 sm:h-16 sm:w-16 p-0 border border-white/20 shadow-xl transition-all duration-300"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </>
          )}

          {/* THUMBNAIL STRIP - Always visible */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl border-t border-white/10">
              <div className="p-4 sm:p-6">
                <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                        index === currentIndex
                          ? "border-blue-400 scale-110 shadow-blue-500/25 ring-2 ring-blue-400/50"
                          : "border-white/30 hover:border-white/70 hover:scale-105 hover:shadow-white/20"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg?height=80&width=80"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HELP TEXT - Always visible */}
          <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm text-center">
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <p className="sm:hidden">Double tap to zoom • Drag to pan • Tap fullscreen</p>
              <p className="hidden sm:block">
                Double click to zoom • Drag to pan • Arrow keys to navigate • Press F for fullscreen
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageViewer
