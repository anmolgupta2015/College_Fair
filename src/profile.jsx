import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Star,
  StarHalf,
  Mail,
  Phone,
  Package,
  School,
  Edit,
  Check,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";


const auth = getAuth();
const db = getFirestore();

export default function ProfilePage({MyProfile}) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);


  const { RouteuserId } = useParams();
  console.log(RouteuserId);
  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const targetUserId = RouteuserId || user.uid;
        console.log(user.uid);
        console.log(RouteuserId);
        const userDoc = await getDoc(doc(db, "users", targetUserId));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
          console.log(profile);
        } else {
          console.error("No user data found in Firestore");
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "CollegeFair"); // Your Cloudinary preset
    data.append("cloud_name", "db8elhbqj"); // Your Cloudinary cloud name

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/db8elhbqj/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const finalData = await res.json();
      const imageUrl = finalData.url;

      // Update profile with new image URL
      const updatedProfile = { ...profile, profileImage: imageUrl };
      setProfile(updatedProfile);
      await setDoc(doc(db, "users", userId), updatedProfile, { merge: true });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Editing function
  const handleEditClick = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save changes to database
  const handleSaveClick = async () => {
    if (userId && editedProfile) {
      try {
        await setDoc(doc(db, "users", userId), editedProfile, { merge: true });
        setProfile(editedProfile);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedProfile(null);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="fill-yellow-400 text-yellow-400 h-5 w-5"
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="fill-yellow-400 text-yellow-400 h-5 w-5"
        />
      );
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="text-gray-300 h-5 w-5" />
      );
    }
    return stars;
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="bg-blue-500 text-white p-6 rounded-t-lg relative">
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveClick}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelClick}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              (MyProfile === "true" )&& (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Edit className="h-5 w-5" />
                </Button>
              )
            )}
          </div>

          <div className="flex flex-col items-center pt-6">
            {/* Profile Image Upload */}
            <div
              className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 bg-white/20 relative`}
            >
              <img
                src={profile.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
          { (MyProfile === "true") && (   <label
  htmlFor="file-upload"
  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:shadow-xl"
>
  <Upload className="h-5 w-5 text-gray-600 group-hover:text-blue-500 transition-all duration-300" />
  <input
    id="file-upload"
    type="file"
    className="hidden"
    accept="image/*"
    onChange={handleImageUpload}
    disabled={isUploading}
  />
</label>)}

            </div>

            {isEditing ? (
              <Input
                name="fullName"
                value={editedProfile.fullName}
                onChange={handleInputChange}
                className="bg-white/20 text-white text-center text-xl font-bold"
              />
            ) : (
              <h2 className="text-2xl font-bold text-center">
                {profile.fullName || "No Name"}
              </h2>
            )}

            <Badge variant="secondary" className="mt-2 font-medium">
              {isEditing ? (
                <Input
                  name="yearofStudy"
                  value={editedProfile.yearofStudy}
                  onChange={handleInputChange}
                  className="bg-transparent border-0 p-0 text-center w-24 h-5"
                />
              ) : (
                `Batch: ${profile.yearofStudy || "N/A"}`
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-medium">Email:</span>
              {isEditing ? (
                <Input
                  name="email"
                  value={editedProfile.email}
                  onChange={handleInputChange}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-gray-700">
                  {profile.email || "Not Provided"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">Mobile:</span>
              {isEditing ? (
                <Input
                  name="phone"
                  value={editedProfile.phone}
                  onChange={handleInputChange}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-gray-700">
                  {profile.phone || "Not Provided"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <span className="font-medium">College:</span>
              {isEditing ? (
                <Input
                  name="collegeName"
                  value={editedProfile.collegeName}
                  onChange={handleInputChange}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-gray-700">
                  {profile.collegeName || "Not Provided"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm text-gray-500">Rating</span>
              <div className="flex mt-1">
                {renderStars(profile.Rating)}
                <span className="ml-2 font-medium">{profile.Rating}</span>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm text-gray-500">Items Sold</span>
              <div className="flex items-center mt-1">
                <Package className="h-5 w-5 text-primary mr-1" />
                <span className="font-medium">{profile.itemsSold}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            Contact {profile.fullName ? profile.fullName.split(" ")[0] : "User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
