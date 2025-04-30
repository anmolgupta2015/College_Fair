import { useState } from "react"
import { db, auth } from "../src/firebase/config"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, ImageIcon, X, Plus, Calendar, Gift, Tag, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ListingPage() {
  const [listingType, setListingType] = useState("sell")
  const [images, setImages] = useState([null, null, null, null, null])
  const [customDetails, setCustomDetails] = useState([{ key: "", value: "" }])

  // Base form data for all listing types
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    location: "",
    // Rent specific fields
    rentPeriod: "day",
    rentAmount: "",
    securityDeposit: "",
    damagePolicy: "",
    availableFrom: "",
    availableTo: "",
    // Donate specific fields
    donationReason: "",
    preferredRecipient: "",
    pickupInstructions: "",
  })

  // Add this helper function at the top of your component, after the useState declarations
  const RequiredLabel = ({ htmlFor, children }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
      {children} <span className="text-red-500">*</span>
    </Label>
  )

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const fileUpload = async (event, index) => {
    const file = event.target.files[0]
    if (!file) {
      return
    }

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
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  // Add a new key-value pair
  const addDetail = () => {
    setCustomDetails([...customDetails, { key: "", value: "" }])
  }

  // Handle changes in key-value pairs
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...customDetails]
    updatedDetails[index][field] = value
    setCustomDetails(updatedDetails)
  }

  // Remove a key-value pair
  const removeDetail = (index) => {
    const updatedDetails = [...customDetails]
    updatedDetails.splice(index, 1)
    setCustomDetails(updatedDetails)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convert customDetails array into a map
    const detailsMap = customDetails.reduce((acc, detail) => {
      if (detail.key && detail.value) {
        acc[detail.key] = detail.value
      }
      return acc
    }, {})

    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        listingType, // Add the listing type
        price: listingType === "sell" ? Number.parseFloat(formData.price) : null,
        rentAmount: listingType === "rent" ? Number.parseFloat(formData.rentAmount) : null,
        securityDeposit: listingType === "rent" ? Number.parseFloat(formData.securityDeposit) : null,
        images: images.filter(Boolean),
        details: detailsMap,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      })
      alert("Your listing has been created successfully!")
    } catch (error) {
      console.error("Error adding document: ", error)
      alert("Failed to create listing.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-muted/30 py-8">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Create a Listing</h1>
            <p className="text-muted-foreground mb-8 text-center md:text-left">Choose how you want to list your item</p>

            {/* Listing Type Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What would you like to do with your item?</CardTitle>
                <CardDescription>Select the type of listing you want to create</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sell" onValueChange={setListingType} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 w-full">
                    <TabsTrigger value="sell" className="flex items-center justify-center gap-1 px-2 sm:gap-2 sm:px-4">
                      <Tag className="h-4 w-4" />
                      <span>Sell</span>
                    </TabsTrigger>
                    <TabsTrigger value="rent" className="flex items-center justify-center gap-1 px-2 sm:gap-2 sm:px-4">
                      <Calendar className="h-4 w-4" />
                      <span>Rent</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="donate"
                      className="flex items-center justify-center gap-1 px-2 sm:gap-2 sm:px-4"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Donate</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sell" className="mt-0">
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p>Sell your item for a fixed price. Perfect for items you no longer need.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="rent" className="mt-0">
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p>Make your item available for temporary use. Great for textbooks, equipment, or furniture.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="donate" className="mt-0">
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p>
                        Give your item to someone who needs it. Help fellow students and contribute to the community.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Provide the essential details about your item</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="title">Title</RequiredLabel>
                      <Input
                        id="title"
                        name="title"
                        placeholder={
                          listingType === "sell"
                            ? "e.g., MacBook Pro 2021 - Like New"
                            : listingType === "rent"
                              ? "e.g., TI-84 Calculator - Available for Semester"
                              : "e.g., Chemistry Textbook - Free to Good Home"
                        }
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="category">Category</RequiredLabel>
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

                      {listingType === "sell" && (
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="price">Price ($)</RequiredLabel>
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
                      )}
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

                {/* Listing Type Specific Fields */}
                {listingType === "rent" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rental Details</CardTitle>
                      <CardDescription>Specify the terms for renting out your item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="rentAmount">Rent Amount ($)</RequiredLabel>
                          <Input
                            id="rentAmount"
                            name="rentAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.rentAmount}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <RequiredLabel htmlFor="rentPeriod">Per</RequiredLabel>
                          <Select
                            value={formData.rentPeriod}
                            onValueChange={(value) => handleSelectChange("rentPeriod", value)}
                            required
                          >
                            <SelectTrigger id="rentPeriod">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hour">Hour</SelectItem>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="semester">Semester</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <RequiredLabel htmlFor="securityDeposit">Security Deposit ($)</RequiredLabel>
                        <Input
                          id="securityDeposit"
                          name="securityDeposit"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.securityDeposit}
                          onChange={handleChange}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          This amount will be returned when the item is returned in good condition
                        </p>
                      </div>

                      <div className="space-y-2">
                        <RequiredLabel htmlFor="damagePolicy">Damage Policy</RequiredLabel>
                        <Textarea
                          id="damagePolicy"
                          name="damagePolicy"
                          placeholder="Describe what happens if the item is damaged or lost (e.g., 'Full security deposit will be kept for any damage')"
                          value={formData.damagePolicy}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="availableFrom">Available From</RequiredLabel>
                          <Input
                            id="availableFrom"
                            name="availableFrom"
                            type="date"
                            value={formData.availableFrom}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="availableTo">Available Until</Label>
                          <Input
                            id="availableTo"
                            name="availableTo"
                            type="date"
                            value={formData.availableTo}
                            onChange={handleChange}
                          />
                          <p className="text-xs text-muted-foreground">Leave blank if no end date</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {listingType === "donate" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Donation Details</CardTitle>
                      <CardDescription>Provide information about your donation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="donationReason">Reason for Donating</Label>
                        <Textarea
                          id="donationReason"
                          name="donationReason"
                          placeholder="Why are you donating this item? (e.g., 'Graduated and no longer need it')"
                          value={formData.donationReason}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredRecipient">Preferred Recipient (Optional)</Label>
                        <Textarea
                          id="preferredRecipient"
                          name="preferredRecipient"
                          placeholder="Do you have a specific type of recipient in mind? (e.g., 'First-year students', 'Anyone in need')"
                          value={formData.preferredRecipient}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <RequiredLabel htmlFor="pickupInstructions">Pickup Instructions</RequiredLabel>
                        <Textarea
                          id="pickupInstructions"
                          name="pickupInstructions"
                          placeholder="Any specific instructions for pickup? (e.g., 'Available weekdays after 5pm')"
                          value={formData.pickupInstructions}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              By donating, you confirm that you are giving this item away for free and expect nothing in
                              return.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>Add up to 5 images of your item (first image will be the cover)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden ${index === 0 ? "border-primary" : "border-border"}`}
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
                                onChange={(e) => fileUpload(e, index)}
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
                    <CardDescription>
                      Provide details about your item to help{" "}
                      {listingType === "sell" ? "buyers" : listingType === "rent" ? "renters" : "recipients"} make a
                      decision
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="description">Description</RequiredLabel>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder={
                          listingType === "sell"
                            ? "Describe your item, including any relevant details about its condition, features, and why you're selling it."
                            : listingType === "rent"
                              ? "Describe your item, including any relevant details about its condition, features, and usage instructions."
                              : "Describe your item, including any relevant details about its condition, features, and why you're donating it."
                        }
                        value={formData.description}
                        onChange={handleChange}
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    {/* Custom Details Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Additional Details</Label>
                        <Button type="button" variant="outline" onClick={addDetail} size="sm" className="h-8">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Detail
                        </Button>
                      </div>

                      {customDetails.map((detail, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center">
                          <Input
                            className="col-span-2"
                            type="text"
                            placeholder="Key (e.g., Color)"
                            value={detail.key}
                            onChange={(e) => handleDetailChange(index, "key", e.target.value)}
                          />
                          <Input
                            className="col-span-2"
                            type="text"
                            placeholder="Value (e.g., Red)"
                            value={detail.value}
                            onChange={(e) => handleDetailChange(index, "value", e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDetail(index)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="location">Pickup Location</RequiredLabel>
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
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white font-medium text-base py-6 transition-all"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {listingType === "sell"
                          ? "List Item for Sale"
                          : listingType === "rent"
                            ? "Create Rental Listing"
                            : "Offer as Donation"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Save as Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-between items-center shadow-lg md:hidden z-10">
                  <div className="text-sm font-medium">Creating {listingType} listing</div>
                  <Button type="submit" size="sm" className="bg-primary text-white">
                    <Upload className="h-3 w-3 mr-1" />
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
