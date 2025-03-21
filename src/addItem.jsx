"use client"

import { useState } from "react"
//import Navbar from "@/components/navbar"
//import Footer from "@/components/footer"
import { db,auth } from "../src/firebase/config"; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, ImageIcon, X, Plus, Info, ReceiptRussianRuble } from "lucide-react"


export default function SellPage() {
  const [images, setImages] = useState([null, null, null, null, null])
  const [customDetails, setCustomDetails] = useState([{ key: "", value: "" }]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    location: "",
  })

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const fileUpload = async (event,index) => {
   const file = event.target.files[0];
   if(!file){
    return;
   }

   const data = new FormData();
   data.append("file",file);
   data.append("upload_preset","CollegeFair");
   data.append("cloud_name","db8elhbqj");

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
    newImageUrls[index] = finalData.url // Update the specific index with the uploaded image URL

    setImages(newImageUrls)
    
  } catch (error) {
    console.error("Error uploading image:", error)
  }

   return;


  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image upload
  const handleImageChange = (index, file) => {
    const newImages = [...images]
    newImages[index] = file
    setImages(newImages)
  }

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  // Add a new key-value pair
const addDetail = () => {
    setCustomDetails([...customDetails, { key: "", value: "" }]);
  };
  
  // Handle changes in key-value pairs
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...customDetails];
    updatedDetails[index][field] = value;
    setCustomDetails(updatedDetails);
  };
  
  // Remove a key-value pair
  const removeDetail = (index) => {
    const updatedDetails = [...customDetails];
    updatedDetails.splice(index, 1);
    setCustomDetails(updatedDetails);
  };
  

  // Handle form submission
    // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Convert customDetails array into a map
    const detailsMap = customDetails.reduce((acc, detail) => {
      if (detail.key && detail.value) {
        acc[detail.key] = detail.value;
      }
      return acc;
    }, {});
  
    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        price: parseFloat(formData.price),
        images: images.filter(Boolean),
        details: detailsMap, // Send custom details as map
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      });
      alert("Your listing has been created successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to create listing.");
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col">
   
      <main className="flex-grow bg-muted/30 py-8">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
            <p className="text-muted-foreground mb-8">Fill out the form below to create your listing</p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Provide the essential details about your item</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., MacBook Pro 2021 - Like New"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                          required
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="textbooks">Textbooks</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="notes">Notes & Study Guides</SelectItem>
                            <SelectItem value="tickets">Event Tickets</SelectItem>
                            <SelectItem value="appliances">Appliances</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="food">Food & Drinks</SelectItem>
                            <SelectItem value="misc">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <RadioGroup
                        value={formData.condition}
                        onValueChange={(value) => handleSelectChange("condition", value)}
                        className="flex flex-wrap gap-4"
                        required
                      >
                        {["New", "Like New", "Good", "Fair", "Used"].map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <RadioGroupItem value={condition.toLowerCase()} id={`condition-${condition}`} />
                            <Label htmlFor={`condition-${condition}`}>{condition}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>Add up to 5 images of your item (first image will be the cover)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden ${index === 0 ? "border-primary" : "border-border"}`}
                        >
                          {image ? (
                            <>
                              <img
                                onChange={fileUpload}
                                src = {image}
                                alt={`Upload ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {index === 0 ? (
                                  <div className="p-2 rounded-full bg-primary/10 mb-2">
                                    <ImageIcon className="h-6 w-6 text-primary" />
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-full bg-muted mb-2">
                                    <Plus className="h-6 w-6 text-muted-foreground" />
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
                              onChange={(e) => fileUpload(e, index)}  // ✅ Pass `fileUpload` function directly
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
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                    <CardDescription>Provide details about your item to help buyers make a decision</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your item, including any relevant details about its condition, features, and why you're selling it."
                        value={formData.description}
                        onChange={handleChange}
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                {/* Custom Details Section */}
<Card>
  <CardHeader>
    <CardTitle>Additional Details</CardTitle>
    <CardDescription>Add any custom information relevant to your item.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {customDetails.map((detail, index) => (
      <div key={index} className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="Key (e.g., Color)"
          value={detail.key}
          onChange={(e) => handleDetailChange(index, "key", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Value (e.g., Red)"
          value={detail.value}
          onChange={(e) => handleDetailChange(index, "value", e.target.value)}
        />
        <button
          type="button"
          onClick={() => removeDetail(index)}
          className="text-red-500 text-sm mt-1"
        >
          Remove
        </button>
      </div>
    ))}

    {/* Add new detail button */}
    <Button
      type="button"
      variant="outline"
      onClick={addDetail}
      className="w-full"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add More Details
    </Button>
  </CardContent>
</Card>

                    <div className="space-y-2">
                      <Label htmlFor="location">Pickup Location</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleSelectChange("location", value)}
                        required
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-campus">North Campus</SelectItem>
                          <SelectItem value="south-dorms">South Dorms</SelectItem>
                          <SelectItem value="west-apartments">West Apartments</SelectItem>
                          <SelectItem value="east-dorms">East Dorms</SelectItem>
                          <SelectItem value="library">Library</SelectItem>
                          <SelectItem value="science-building">Science Building</SelectItem>
                          <SelectItem value="math-building">Math Building</SelectItem>
                          <SelectItem value="sports-center">Sports Center</SelectItem>
                          <SelectItem value="student-union">Student Union</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit */}
                <Card className="shadow-lg border border-gray-200">
                <CardContent className="pt-6">
                  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
                    <p className="font-medium">Before you submit</p>
                    <p>Ensure your listing follows our guidelines. Prohibited items will be removed.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" className="bg-primary hover:bg-primary-dark text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Create Listing
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="border-primary text-primary">
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            </form>
          </div>
        </div>
      </main>
    
    </div>
  )
}
