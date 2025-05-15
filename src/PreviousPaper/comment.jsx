"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"

function CommentSection() {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [username, setUsername] = useState("Anonymous User")

  // Load comments from localStorage on component mount
  useEffect(() => {
    const savedComments = localStorage.getItem("comments")
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }

    // Generate a random username if not set
    const randomUser = localStorage.getItem("commentUsername")
    if (randomUser) {
      setUsername(randomUser)
    } else {
      const newUsername = `User${Math.floor(Math.random() * 10000)}`
      localStorage.setItem("commentUsername", newUsername)
      setUsername(newUsername)
    }
  }, [])

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments))
  }, [comments])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: username,
      createdAt: Date.now(),
      initials: getInitials(username),
    }

    setComments((prev) => [comment, ...prev])
    setNewComment("")
  }

  // Get initials from a name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Comment Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
              <span className="text-sm font-semibold text-gray-600">{getInitials(username)}</span>
            </div>
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 min-h-[100px] p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
              <span className="text-sm">📤</span>
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                <span className="text-sm font-semibold text-gray-600">{comment.initials}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{comment.text}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
