"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, collection } from "firebase/firestore"
import {
  Star,
  Mail,
  Phone,
  Package,
  School,
  Edit,
  Check,
  X,
  MessageCircle,
  Award,
  TrendingUp,
  Users,
  Heart,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react"
import ShareButton from "./ProductDetails/sharebutton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"

const auth = getAuth()
const db = getFirestore()

export default function ProfilePage({ MyProfile }) {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [userRating, setUserRating] = useState()
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const { RouteuserId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)
        setCurrentUser(user)
        const targetUserId = RouteuserId || user.uid

        try {
          const userDocRef = doc(db, "users", targetUserId)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()

            // Fetch ratings from subcollection
            const ratingsSnapshot = await getDocs(collection(userDocRef, "ratings"))
            const ratings = ratingsSnapshot.docs.map((doc) => doc.data())
            setUserRating(ratings)
            const average = calculateAverageRating(ratings)
            const total = ratings.length

            setProfile({
              ...userData,
              ratings,
              averageRating: average,
              totalRatings: total,
            })
          } else {
            console.warn("User doc not found")
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      } else {
        alert("Please login first before viewing anyones profile")
        navigate("/login")
        return
      }
    })

    return () => unsubscribe()
  }, [RouteuserId])

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / ratings.length).toFixed(1)
  }

  /*Profile-Image*/
  const handleImageUpload = async (event) => {
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

      const finalData = await res.json()
      const imageUrl = finalData.url

      const updatedProfile = { ...profile, profileImage: imageUrl }
      setProfile(updatedProfile)
      await setDoc(doc(db, "users", userId), updatedProfile, { merge: true })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  /*Rating-Submit*/
  const handleRatingSubmit = async () => {
    if (!userId || !userRating) return;


    setIsSubmittingRating(true)

    try {
      const newRating = {
        userId,
        rating: userRating,
        comment: ratingComment,
        timestamp: new Date(),
        userName: currentUser?.displayName || "Anonymous",
      }

      const targetUserId = RouteuserId
      const ratingsRef = collection(db, "users", targetUserId, "ratings")

      await addDoc(ratingsRef, newRating)

      const updatedRatings = [...profile.ratings, newRating]
      console.log(updatedRatings)
      const newAverage = calculateAverageRating(updatedRatings)

      await updateDoc(doc(db, "users", targetUserId), {
        averageRating: newAverage,
        totalRatings: updatedRatings.length,
      })

      setUserRating(0)
      setRatingComment("")
      setProfile({
        ...profile,
        averageRating: newAverage,
        totalRatings: updatedRatings.length,
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleEditClick = () => {
    setEditedProfile({ ...profile })
    setIsEditing(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveClick = async () => {
    if (userId && editedProfile) {
      try {
        await setDoc(doc(db, "users", userId), editedProfile, { merge: true })
        setProfile(editedProfile)
        setIsEditing(false)
      } catch (error) {
        console.error("Error updating profile:", error)
      }
    }
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setEditedProfile(null)
  }

  const renderStars = (rating, interactive = false, size = "w-4 h-4") => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size} cursor-pointer transition-all duration-200 ${
            i <= (interactive ? hoverRating || userRating : rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onClick={interactive ? () => setUserRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />,
      )
    }
    return stars
  }

  const isOwnProfile = MyProfile === "true"
  const canRate = !isOwnProfile && userId && userId !== (RouteuserId || userId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        {/* Mobile-First Header Card */}
        <Card className="mb-4 sm:mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <CardContent className="p-0">
            {/* Cover Section */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Edit Controls - Mobile Optimized */}
              {isOwnProfile && (
                <div className="absolute top-3 right-3 z-20">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveClick}
                        className="bg-white/90 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline sm:inline">Save</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelClick}
                        className="bg-white/90 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline sm:inline">Cancel</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEditClick}
                      className="bg-white/90 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline sm:inline">Edit Profile</span>
                      <span className="xs:hidden sm:hidden">Edit</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Profile Content - Responsive Layout */}
              <div className="relative pt-4 pb-6 px-4 sm:pt-6 sm:pb-8 sm:px-6">
                {/* Mobile: Centered Layout, Desktop: Flex Layout */}
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-6">
                  {/* Profile Image - Always Visible */}
                  <div className="relative flex-shrink-0 z-10">
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 border-3 sm:border-4 border-white shadow-2xl ring-2 ring-white/50">
                      <AvatarImage
                        src={profile?.profileImage || "/placeholder.svg?height=128&width=128"}
                        alt={profile?.fullName || "Profile"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Camera Icon for Own Profile */}
                    {isOwnProfile && (
                      <label className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border-2 border-white">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    )}

                    {/* Upload Indicator */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Profile Info - Responsive Text */}
                  <div className="flex-1 text-white text-center sm:text-left w-full sm:w-auto">
                    {/* Name */}
                    {isEditing ? (
                      <Input
                        name="fullName"
                        value={editedProfile?.fullName || ""}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white text-lg sm:text-xl lg:text-2xl font-bold border-white/30 mb-3 text-center sm:text-left placeholder-white/70"
                        placeholder="Full Name"
                      />
                    ) : (
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 break-words leading-tight">
                        {profile?.fullName || "No Name"}
                      </h1>
                    )}

                    {/* Badges and Rating - Responsive Stack */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-2 py-1"
                      >
                        <School className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {isEditing ? (
                          <Input
                            name="yearofStudy"
                            value={editedProfile?.yearofStudy || ""}
                            onChange={handleInputChange}
                            className="bg-transparent border-0 p-0 text-white w-16 h-4 text-xs placeholder-white/70"
                            placeholder="Year"
                          />
                        ) : (
                          <span className="whitespace-nowrap">Batch {profile?.yearofStudy || "N/A"}</span>
                        )}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {renderStars(Number.parseFloat(profile?.averageRating) || 0, false, "w-4 h-4")}
                        </div>
                        <span className="ml-1 font-medium text-sm whitespace-nowrap">
                          {profile?.averageRating || "0.0"} ({profile?.totalRatings || 0})
                        </span>
                      </div>
                    </div>

                    {/* Location and Stats - Responsive */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        {isEditing ? (
                          <Input
                            name="collegeName"
                            value={editedProfile?.collegeName || ""}
                            onChange={handleInputChange}
                            className="bg-transparent border-0 p-0 text-white w-32 h-4 text-sm placeholder-white/70"
                            placeholder="College"
                          />
                        ) : (
                          <span className="break-words max-w-48 sm:max-w-none">
                            {profile?.collegeName || "College"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{profile?.itemsSold || 0} items sold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Mobile-First Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar - Stats and Actions */}
          <div className="lg:order-1 order-2 space-y-4">
            {/* Stats Cards - Always 2 Columns */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-blue-700">{profile?.averageRating || "0.0"}</div>
                <div className="text-xs sm:text-sm text-blue-600">Average Rating</div>
              </Card>

              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-green-700">{profile?.itemsSold || 0}</div>
                <div className="text-xs sm:text-sm text-green-600">Items Sold</div>
              </Card>
            </div>

            {/* Action Buttons - For Other Users */}
            {!isOwnProfile && (
              <Card className="p-4 border-0 shadow-lg">
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base py-3 h-auto">
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="break-words">Message {profile?.fullName?.split(" ")[0] || "User"}</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="text-xs sm:text-sm py-2 h-auto">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Follow
                    </Button>
                    <Button variant="outline" className="text-xs sm:text-sm py-2 h-auto">
                      <ShareButton />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Rating Section - For Other Users */}
            {canRate && (
              <Card className="p-4 border-0 shadow-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Rate This User
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-center gap-1">{renderStars(0, true, "w-7 h-7")}</div>

                  <Textarea
                    placeholder="Share your experience (optional)"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="resize-none text-sm min-h-[80px]"
                    rows={3}
                  />

                  <Button
                    onClick={handleRatingSubmit}
                    disabled={!userRating || isSubmittingRating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-sm sm:text-base py-3 h-auto"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content - Details and Reviews */}
          <div className="lg:col-span-2 lg:order-2 order-1">
            <Card className="border-0 shadow-lg">
              <Tabs defaultValue="details" className="w-full">
                {/* Mobile-Optimized Tab List */}
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="details" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-4 sm:p-6 space-y-4">
                  <div className="grid gap-4">
                    {/* Email */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1">Email</div>
                        {isEditing ? (
                          <Input
                            name="email"
                            value={editedProfile?.email || ""}
                            onChange={handleInputChange}
                            className="text-sm"
                            placeholder="Enter email address"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm break-all">{profile?.email || "Not provided"}</div>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Phone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1">Phone</div>
                        {isEditing ? (
                          <Input
                            name="phone"
                            value={editedProfile?.phone || ""}
                            onChange={handleInputChange}
                            className="text-sm"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm break-all">{profile?.phone || "Not provided"}</div>
                        )}
                      </div>
                    </div>

                    {/* College */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <School className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1">College</div>
                        {isEditing ? (
                          <Input
                            name="collegeName"
                            value={editedProfile?.collegeName || ""}
                            onChange={handleInputChange}
                            className="text-sm"
                            placeholder="Enter college name"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm break-words">
                            {profile?.collegeName || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio - Edit Mode */}
                    {isEditing && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="font-medium mb-2 text-sm sm:text-base">Bio</div>
                        <Textarea
                          name="bio"
                          value={editedProfile?.bio || ""}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="text-sm resize-none"
                        />
                      </div>
                    )}

                    {/* Bio - Display Mode */}
                    {!isEditing && profile?.bio && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="font-medium mb-2 text-sm sm:text-base">Bio</div>
                        <div className="text-gray-600 text-sm break-words leading-relaxed">{profile?.bio}</div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {profile?.ratings &&
                    profile?.ratings.filter((r) => r.comment && r.comment.trim() !== "").length > 0 ? (
                      profile?.ratings
                        .filter((rating) => rating.comment && rating.comment.trim() !== "")
                        .map((rating, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback className="text-sm font-medium">
                                    {rating.userName?.charAt(0)?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm sm:text-base break-words">
                                  {rating.userName || "Anonymous"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {renderStars(rating.rating, false, "w-4 h-4")}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm break-words leading-relaxed mb-2">{rating.comment}</p>
                            <div className="text-xs text-gray-400">
                              {rating.timestamp?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-base font-medium mb-1">No reviews yet</p>
                        <p className="text-sm">Be the first to rate this user!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="p-4 sm:p-6">
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base font-medium mb-1">Activity feed coming soon</p>
                    <p className="text-sm">Recent transactions and interactions will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
