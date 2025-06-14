"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, ImageIcon, X, Send, BookOpen, HelpCircle } from "lucide-react"

function CommentSection({paperId,paperTitle = "Hello"}) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [username, setUsername] = useState("Anonymous Student")
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [likedComments, setLikedComments] = useState(new Set())
   console.log(paperId);
  // Load comments from localStorage on component mount
  useEffect(() => {
    
  }, [paperTitle])

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 4) {
      alert("You can only upload up to 4 images per comment")
      return
    }

    setSelectedImages((prev) => [...prev, ...files])

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index])
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!newComment.trim() && selectedImages.length === 0) return

    // Convert images to base64 for storage
    const imagePromises = selectedImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises).then((imageDataUrls) => {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: username,
        createdAt: Date.now(),
        initials: getInitials(username),
        images: imageDataUrls,
        likes: 0,
        replies: Math.floor(Math.random() * 3), // Random replies for demo
      }

      setComments((prev) => [comment, ...prev])
      setNewComment("")
      setSelectedImages([])

      // Clean up preview URLs
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
      setImagePreviewUrls([])
    })
  }

  const handleLike = (commentId) => {
    const newLikedComments = new Set(likedComments)
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId)
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, likes: Math.max(0, comment.likes - 1) } : comment,
        ),
      )
    } else {
      newLikedComments.add(commentId)
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
      )
    }
    setLikedComments(newLikedComments)
  }

  // Get initials from a name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getRandomColor = (name) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-orange-500 to-amber-500",
      "bg-gradient-to-br from-indigo-500 to-blue-500",
      "bg-gradient-to-br from-teal-500 to-green-500",
      "bg-gradient-to-br from-sky-500 to-blue-500",
    ]
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  return (
    <div className="max-w-3xl mx-auto p-4 mt-8 border-t-2 border-gray-100 pt-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Discussion Forum
        </h2>
        <p className="text-gray-600">
          Discuss this question paper with other students. Share your doubts, solutions, and insights.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {paperTitle}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {comments.length} Comments
          </Badge>
        </div>
      </div>

      {/* Comment Form */}
      <Card className="mb-8 shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className={`w-10 h-10 ${getRandomColor(username)} border-2 border-white shadow-md`}>
                <AvatarFallback className="text-white font-bold">{getInitials(username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Ask a question, share your solution, or discuss this paper..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] border-2 border-gray-200 focus:border-blue-400 transition-colors resize-none text-base"
                />

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                  Add Images
                </label>
                <span className="text-xs text-gray-500">(Solutions, diagrams, etc.)</span>
              </div>

              <Button
                type="submit"
                disabled={!newComment.trim() && selectedImages.length === 0}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <Card className="text-center py-10 bg-gradient-to-br from-gray-50 to-white border-dashed border-2 border-gray-200">
            <CardContent>
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No discussions yet</h3>
              <p className="text-gray-500">
                Be the first to ask a question or share your insights about this question paper!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <Avatar
                    className={`w-10 h-10 ${getRandomColor(comment.author)} border-2 border-white shadow-sm flex-shrink-0`}
                  >
                    <AvatarFallback className="text-white font-bold">{comment.initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>

                    {comment.text && (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    )}

                    {/* Comment Images */}
                    {comment.images && comment.images.length > 0 && (
                      <div
                        className={`grid gap-2 ${
                          comment.images.length === 1
                            ? "grid-cols-1"
                            : comment.images.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-2"
                        }`}
                      >
                        {comment.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Comment image ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(image, "_blank")}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-1">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:bg-blue-50 ${
                          likedComments.has(comment.id)
                            ? "text-blue-500 bg-blue-50"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? "fill-current" : ""}`} />
                        <span className="text-sm font-medium">{comment.likes}</span>
                      </button>

                      <button className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{comment.replies}</span>
                      </button>

                      <button className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
