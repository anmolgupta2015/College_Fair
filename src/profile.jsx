"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc,getDocs, setDoc,addDoc, updateDoc, arrayUnion,collection } from "firebase/firestore"
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
  Share2,
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
          const ratings = ratingsSnapshot.docs.map(doc => doc.data())
         // console.log(ratings);
          setUserRating(ratings);
          const average = calculateAverageRating(ratings)
          //console.log(average);
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
      setProfile(null)
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
  if (!userId || !userRating || userId === RouteuserId) return

  setIsSubmittingRating(true)

  try {
    const newRating = {
      userId,
      rating: userRating,
      comment: ratingComment,
      timestamp: new Date(),
      userName: currentUser?.displayName || currentUser?.email || "Anonymous",
    }

    const targetUserId = RouteuserId
    const ratingsRef = collection(db, "users", targetUserId, "ratings")


    await addDoc(ratingsRef, newRating)

    const updatedRatings = [...profile.ratings, newRating]
    console.log(updatedRatings);
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

  const renderStars = (rating, interactive = false, size = "w-5 h-5") => {
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

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const isOwnProfile = MyProfile === "true"
  const canRate = !isOwnProfile && userId && userId !== (RouteuserId || userId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <Card className="mb-4 sm:mb-6 overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <CardContent className="p-0">
            <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Edit Controls */}
              {isOwnProfile && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveClick}
                        className="bg-white/90 hover:bg-white text-xs sm:text-sm"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelClick}
                        className="bg-white/90 hover:bg-white text-xs sm:text-sm"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEditClick}
                      className="bg-white/90 hover:bg-white text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Profile Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 md:gap-6">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 sm:border-4 border-white shadow-xl">
                      <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.fullName} />
                      <AvatarFallback className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {profile.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {isOwnProfile && (
                      <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                  </div>

                  {/* Name and Basic Info */}
                  <div className="flex-1 text-white text-center sm:text-left">
                    {isEditing ? (
                      <Input
                        name="fullName"
                        value={editedProfile.fullName}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white text-lg sm:text-xl md:text-2xl font-bold border-white/30 mb-2 text-center sm:text-left"
                        placeholder="Full Name"
                      />
                    ) : (
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 break-words">
                        {profile.fullName || "No Name"}
                      </h1>
                    )}

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                        <School className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {isEditing ? (
                          <Input
                            name="yearofStudy"
                            value={editedProfile.yearofStudy}
                            onChange={handleInputChange}
                            className="bg-transparent border-0 p-0 text-white w-16 sm:w-20 h-4 sm:h-5 text-xs sm:text-sm"
                            placeholder="Year"
                          />
                        ) : (
                          `Batch ${profile.yearofStudy || "N/A"}`
                        )}
                      </Badge>

                      <div className="flex items-center gap-1">
                        {renderStars(
                          Number.parseFloat(profile.averageRating) || 0,
                          false,
                          "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5",
                        )}
                        <span className="ml-1 font-medium text-xs sm:text-sm">
                          {profile.averageRating || "0.0"} ({profile.totalRatings || 0})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        {isEditing ? (
                          <Input
                            name="collegeName"
                            value={editedProfile.collegeName}
                            onChange={handleInputChange}
                            className="bg-transparent border-0 p-0 text-white w-24 sm:w-32 h-4 sm:h-5 text-xs sm:text-sm"
                            placeholder="College"
                          />
                        ) : (
                          <span className="truncate max-w-32 sm:max-w-none">{profile.collegeName || "College"}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                        {profile.itemsSold || 0} items sold
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Stats and Actions */}
          <div className="xl:order-1 order-2 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-blue-700">{profile.averageRating || "0.0"}</div>
                <div className="text-xs sm:text-sm text-blue-600">Average Rating</div>
              </Card>

              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-green-700">{profile.itemsSold || 0}</div>
                <div className="text-xs sm:text-sm text-green-600">Items Sold</div>
              </Card>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <Card className="p-3 sm:p-4 border-0 shadow-lg">
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="truncate">Message {profile.fullName?.split(" ")[0]}</span>
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs sm:text-sm py-2 sm:py-3">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Follow
                    </Button>
                    <Button variant="outline" className="flex-1 text-xs sm:text-sm py-2 sm:py-3">
                     
                      <ShareButton/>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Rate This User */}
            {canRate && (
              <Card className="p-3 sm:p-4 border-0 shadow-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Rate This User
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-center gap-1">{renderStars(0, true, "w-6 h-6 sm:w-8 sm:h-8")}</div>

                  <Textarea
                    placeholder="Share your experience (optional)"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="resize-none text-sm"
                    rows={3}
                  />

                  <Button
                    onClick={handleRatingSubmit}
                    disabled={!userRating || isSubmittingRating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-sm sm:text-base py-2 sm:py-3"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Details and Reviews */}
          <div className="xl:col-span-2 xl:order-2 order-1">
            <Card className="border-0 shadow-lg">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="details" className="text-xs sm:text-sm py-2 sm:py-3">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 sm:py-3">
                    <span className="hidden sm:inline">Top Reviews</span>
                    <span className="sm:hidden">Reviews</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm py-2 sm:py-3">
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="grid gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">Email</div>
                        {isEditing ? (
                          <Input
                            name="email"
                            value={editedProfile.email}
                            onChange={handleInputChange}
                            className="mt-1 text-sm"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm break-all">{profile.email || "Not provided"}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">Phone</div>
                        {isEditing ? (
                          <Input
                            name="phone"
                            value={editedProfile.phone}
                            onChange={handleInputChange}
                            className="mt-1 text-sm"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm">{profile.phone || "Not provided"}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <School className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">College</div>
                        {isEditing ? (
                          <Input
                            name="collegeName"
                            value={editedProfile.collegeName}
                            onChange={handleInputChange}
                            className="mt-1 text-sm"
                          />
                        ) : (
                          <div className="text-gray-600 text-sm break-words">
                            {profile.collegeName || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="font-medium mb-2 text-sm sm:text-base">Bio</div>
                        <Textarea
                          name="bio"
                          value={editedProfile.bio || ""}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="text-sm"
                        />
                      </div>
                    )}

                    {!isEditing && profile.bio && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="font-medium mb-2 text-sm sm:text-base">Bio</div>
                        <div className="text-gray-600 text-sm break-words">{profile.bio}</div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-3 sm:p-6">
  <div className="space-y-3 sm:space-y-4">
    {profile.ratings && profile.ratings.filter(r => r.comment && r.comment.trim() !== "").length > 0 ? (
      profile.ratings
        .filter(rating => rating.comment && rating.comment.trim() !== "")
        .map((rating, index) => (
          <div key={index} className="p-3 sm:p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs sm:text-sm">
                    {rating.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm sm:text-base truncate">
                  {rating.userName}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {renderStars(rating.rating, false, "w-3 h-3 sm:w-4 sm:h-4")}
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm break-words">{rating.comment}</p>
            <div className="text-xs text-gray-400 mt-2">
              {rating.timestamp?.toDate?.()?.toLocaleDateString() || "Recently"}
            </div>
          </div>
        ))
    ) : (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm sm:text-base">No reviews yet</p>
        <p className="text-xs sm:text-sm">Be the first to rate this user!</p>
      </div>
    )}
  </div>
</TabsContent>

                <TabsContent value="activity" className="p-3 sm:p-6">
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">Activity feed coming soon</p>
                    <p className="text-xs sm:text-sm">Recent transactions and interactions will appear here</p>
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
