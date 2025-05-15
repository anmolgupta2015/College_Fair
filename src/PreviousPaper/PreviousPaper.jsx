"use client"

import { useEffect, useState } from "react"
import { getDocs, collection } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, FileText, Search, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"


//const navigate = useNavigate();
export default function QuestionPaperDisplay() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("")

  const navigate = useNavigate(); // For React Router DOM

  const handleViewFullScreen = (paper) => {
    navigate(`/question_paper/question_paper_browse/${paper.id}`); // For React Router DOM
  };


  // Fetch papers from Firestore
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questionPaper"))
        const fetchedPapers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setPapers(fetchedPapers)
        if (fetchedPapers.length > 0) {
          setSelectedPaper(fetchedPapers[0])
        }
      } catch (error) {
        console.log("Error fetching papers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPapers()
  }, [])

  // Get valid images (non-null)
  const getValidImages = (paper) => {
    return paper?.images?.filter((img) => img !== null) || []
  }

  // Filter papers based on search term and branch filter
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.courseId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBranch = branchFilter === "" || paper.Branch === branchFilter

    return matchesSearch && matchesBranch
  })

  // Get unique branches for filter dropdown
  const branches = [...new Set(papers.map((paper) => paper.Branch))].filter(Boolean)

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Question Papers Found</h3>
        <p className="text-gray-500 max-w-md">There are currently no question papers available in the database.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Question Papers</h1>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by subject or course ID"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setBranchFilter("")
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Paper List */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-medium mb-4">Available Papers ({filteredPapers.length})</h2>

          {filteredPapers.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No papers match your search</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredPapers.map((paper) => (
                <Card
                  key={paper.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPaper?.id === paper.id ? "border-primary border-2" : ""
                  }`}
                  onClick={() => {
                    setSelectedPaper(paper)
                    setActiveImageIndex(0)
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{paper.Subject || "Untitled Paper"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">{paper.courseId}</Badge>
                      <Badge variant="secondary">{paper.Branch}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{getValidImages(paper).length} image(s)</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Paper Details */}
        <div className="md:col-span-1 lg:col-span-2">
          {selectedPaper ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedPaper.Subject || "Untitled Paper"}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="text-sm">{selectedPaper.courseId}</Badge>
                      <Badge variant="outline" className="text-sm">
                        {selectedPaper.Branch}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Image Viewer */}
              <div className="p-6">
                {getValidImages(selectedPaper).length > 0 ? (
                  <div className="space-y-4">
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                      <div className="aspect-[16/9] relative">
                        <img
                          src={getValidImages(selectedPaper)[activeImageIndex] || "/placeholder.svg"}
                          alt={`Question paper image ${activeImageIndex + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      {getValidImages(selectedPaper).length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full ml-2 opacity-80 hover:opacity-100"
                            onClick={() =>
                              setActiveImageIndex(
                                (prev) =>
                                  (prev - 1 + getValidImages(selectedPaper).length) %
                                  getValidImages(selectedPaper).length,
                              )
                            }
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full mr-2 opacity-80 hover:opacity-100"
                            onClick={() =>
                              setActiveImageIndex((prev) => (prev + 1) % getValidImages(selectedPaper).length)
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Image Navigation */}
                    {getValidImages(selectedPaper).length > 1 && (
                      <div className="flex justify-center gap-2">
                        {getValidImages(selectedPaper).map((_, index) => (
                          <Button
                            key={index}
                            variant={activeImageIndex === index ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0 rounded-full"
                            onClick={() => setActiveImageIndex(index)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No images available for this paper</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 bg-gray-50 border-t">
                <h3 className="text-lg font-medium mb-4">Paper Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Course ID</p>
                    <p className="font-medium">{selectedPaper.courseId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium">{selectedPaper.Branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">{selectedPaper.Subject}</p>
                  </div>
                  <div>
                  <Button
            variant="outline"
            size="sm"
            onClick={()=>handleViewFullScreen(selectedPaper)}
            className="w-full justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Screen
          </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Select a paper to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
