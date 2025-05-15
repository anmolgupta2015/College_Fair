"use client"

import { useState } from "react"
import { X, ImageIcon, Plus, Upload, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { addDoc,collection } from "firebase/firestore"
import { db } from "@/firebase/config"

export default function UploadForm() {
 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [branch, setBranch] = useState("")
  const [courseId, setCourseId] = useState("")
  const [subject, setSubject] = useState("")
  const [images, setImages] = useState(Array(5).fill(null))
  console.log(images)
  console.log(branch,courseId,subject);
  const handleSubmit = async (e)=>{
    e.preventDefault();
    try{
        
      await addDoc(collection(db,"questionPaper"),{
        Branch:branch,
        Subject:subject,
        courseId:courseId,
        images:images
      })
     alert("Question Paper Uploaded. Thankyou for helping other students :-)")
    }
    catch(error){
        console.error("Error adding document: ", error)
        alert("Failed to add Questioin Paper.")
    }
  }
  const fileUpload = async (event, index) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "CollegeFair")
    data.append("cloud_name", "db8elhbqj")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/db8elhbqj/image/upload", {
        method: "POST",
        body: data,
      })

      if (!res.ok) {
        throw new Error("Failed to upload image")
      }

      const finalData = await res.json()
      const newImageUrls = [...images]
      newImageUrls[index] = finalData.url

      setImages(newImageUrls)
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }


  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Upload Question Paper</CardTitle>
          <CardDescription className="text-center">
            Share study materials with your peers. Complete the form below to upload a question paper.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
    <Label htmlFor="branch" className="font-medium">
      Branch Name <span className="text-red-500">*</span>
    </Label>
    <select
      id="branch"
      value={branch}
      onChange={(e) => setBranch(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-primary/20"
      required
    >
      <option value="" disabled>
        Select a branch
      </option>
      <option value="Computer Science">Computer Science</option>
      <option value="Electrical Engineering">Electrical Engineering</option>
      <option value="Mechanical Engineering">Mechanical Engineering</option>
      <option value="Civil Engineering">Civil Engineering</option>
      <option value="Material Science and Engineering">Material Science and Engineering</option>
      <option value="Aerospace Engineering">Aerospace Engineering</option>
      <option value="Electronics and Communication Engieering">Electronics and Communication Engieering</option>
      <option value="Aritificial Intelligence">Artificial Intelligence</option>
      <option value="Data Science">Data Science</option>
      <option value="Production and Industrial Engineering">Production and Industrial Engineering</option>
      <option value="B. Design">B. Design</option>
      <option value="Mathematics and Computation">Mathematics and Computation</option>
      {/* Add more branch options as needed */}
    </select>
  </div>

              <div className="space-y-2">
                <Label htmlFor="courseId" className="font-medium">
                  Course ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="courseId"
                  placeholder="e.g., CS101"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="font-medium">
                Subject Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Data Structures and Algorithms"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">
                  Question Paper Images <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">Upload up to 5 images</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all",
                      index === 0 ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
                      image && "border-0",
                    )}
                  >
                    {image ? (
                      <>
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Upload ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {index === 0 ? (
                            <div className="p-2 rounded-full bg-primary/10 mb-2">
                              <ImageIcon className="h-5 w-5 text-primary" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-muted mb-2">
                              <Plus className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {index === 0 ? "Add cover image" : "Add image"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => fileUpload(e, index)}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
             
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full m-4 py-4 text-lg font-medium transition-all"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Question Paper
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By uploading, you agree to share this content with other students.
            
            
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
