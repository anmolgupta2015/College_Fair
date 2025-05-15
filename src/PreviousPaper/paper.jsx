"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import ShareButton from "../ProductDetails/sharebutton"
import CommentSection from "./comment"

import { FileText, Download, BookOpen, ChevronLeft, ChevronRight, Bookmark, Share2, Eye, Calendar, GraduationCap, BookMarked, Code } from 'lucide-react'

function PaperDetails() {
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { paperId } = useParams()

  useEffect(() => {
    const fetchPaper = async () => {
      if (!paperId) {
        setError("No Paper ID provided")
        setLoading(false)
        return
      }

      try {
        const paperRef = doc(db, "questionPaper", paperId)
        const paperSnap = await getDoc(paperRef)

        if (paperSnap.exists()) {
          const paperData = paperSnap.data()
          console.log(paperData)
          setPaper(paperData)
        } else {
          console.log(`Paper with ID ${paperId} not found.`)
          setError(`Paper with ID ${paperId} not found.`)
        }
      } catch (error) {
        console.error("Error fetching paper:", error)
        setError("Failed to load paper details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPaper()
  }, [paperId])

  // For demo purposes, using sample data if no data is loaded
  const samplePaper = {
    branch: "Mechanical Engineering",
    subject: "ThermoDynamics",
    courseId: "ME1010",
    images: [
      "http://res.cloudinary.com/db8elhbqj/image/upload/sample1",
      "http://res.cloudinary.com/db8elhbqj/image/upload/sample2",
      "http://res.cloudinary.com/db8elhbqj/image/upload/sample3",
      null,
      null
    ]
  }

  const paperData = paper || samplePaper

  // Filter out null images
  const validImages = paperData.images ? paperData.images.filter(img => img !== null) : [];
    const payload = {
    Images : validImages,
    Subject : paperData.Subject,
  }
  console.log(payload);
   
     async function handleDownload(){
  

    try {
      const response = await fetch("http://127.0.0.1:5000/download_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paperData.Subject} QuestionPaper.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    alert("Error downloading PDF!");
    console.error(error);
  }
  };
  const nextImage = () => {
    if (currentImageIndex < validImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500 font-medium">Loading question paper...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-700">Error Loading Paper</h2>
        </div>
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
       
        </nav>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Paper preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              {/* Paper header */}
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{paperData.subject} Question Paper</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span>{paperData.branch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-purple-500" />
                    <span>{paperData.courseId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <span>124 views</span>
                  </div>
                </div>
              </div>

              {/* Paper image viewer */}
              <div className="relative bg-gray-50 border-b border-gray-100">
                <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
                  {validImages.length > 0 ? (
                    <img 
                      src={validImages[currentImageIndex] || "/placeholder.svg"} 
                      alt={`Question paper page ${currentImageIndex + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <FileText className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-400 text-lg font-medium">No images available</p>
                      <p className="text-gray-400 text-sm mt-2">This question paper doesn't have any images</p>
                    </div>
                  )}
                </div>

                {/* Navigation arrows */}
                {validImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <button 
                      onClick={nextImage}
                      disabled={currentImageIndex === validImages.length - 1}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center ${currentImageIndex === validImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Page indicator */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                    Page {currentImageIndex + 1} of {validImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail navigation */}
              {validImages.length > 1 && (
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {validImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-purple-500' : 'border-transparent hover:border-purple-200'}`}
                      >
                        <img 
                          src={img || "/placeholder.svg"} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                
                 <ShareButton/>
                </div>
                <button onClick = {handleDownload} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Paper details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 sticky top-4">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Paper Details
                </h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                    <p className="text-gray-900 font-medium">{paperData.Branch}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <BookMarked className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                    <p className="text-gray-900 font-medium">{paperData.Subject}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Code className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Course ID</h3>
                    <p className="text-gray-900 font-medium">{paperData.courseId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Uploaded On</h3>
                    <p className="text-gray-900 font-medium"></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pages</h3>
                    <p className="text-gray-900 font-medium">{validImages.length} pages</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-b-2xl">
                <h3 className="text-sm font-medium text-purple-800 mb-2">About this paper</h3>
                <p className="text-sm text-purple-700">
                  This question paper is from {paperData.subject} ({paperData.courseId}) for {paperData.branch} students. 
                  It contains {validImages.length} pages of questions and can be downloaded for offline study.
                </p>
              </div>
            </div>
          </div>
        </div>

      
         
        </div>
        <CommentSection/>
      </div>
   
  )
}

export default PaperDetails;
