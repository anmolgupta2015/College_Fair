"use client"

import { useEffect, useRef, useState } from "react"
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  updateDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore"
import { formatTimeAgo, getInitials, getAvatarColor } from "./chatUtils"
import { useNavigate } from "react-router-dom"

const db = getFirestore()

const ChatRoom = ({ chatId, currentUser, onBackClick, productLink }) => {
  const [chatInfo, setChatInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  //const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [images, setImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  //const [productLink,setproductLink] = useState("");
  const [showMarkAsSoldModal, setShowMarkAsSoldModal] = useState(false)
  const [isProductSold, setIsProductSold] = useState(false)

  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const fileInputRef = useRef(null)
  const hasMarkedAsRead = useRef(false)
  const navigate = useNavigate()

  // Mark chat as read when component mounts and when new messages arrive
  //console.log(productLink);
  useEffect(() => {
    const markChatAsRead = async (chatId, userId) => {
      try {
        const readRef = doc(db, "chats", chatId, "readStatus", userId)
        await setDoc(
          readRef,
          {
            lastReadAt: serverTimestamp(),
          },
          { merge: true },
        )
        hasMarkedAsRead.current = true
      } catch (error) {
        console.error("Error marking chat as read:", error)
      }
    }

    if (chatId && currentUser?.uid) {
      markChatAsRead(chatId, currentUser.uid)
    }
  }, [chatId, currentUser])

  // Mark as read when new messages arrive (if chat is currently open)
  useEffect(() => {
    if (messages.length > 0 && hasMarkedAsRead.current && chatId && currentUser?.uid) {
      const markAsReadDebounced = setTimeout(async () => {
        try {
          const readRef = doc(db, "chats", chatId, "readStatus", currentUser.uid)
          await setDoc(
            readRef,
            {
              lastReadAt: serverTimestamp(),
            },
            { merge: true },
          )
        } catch (error) {
          console.error("Error updating read status:", error)
        }
      }, 500) // Debounce to avoid too many writes

      return () => clearTimeout(markAsReadDebounced)
    }
  }, [messages.length, chatId, currentUser])

  useEffect(() => {
    const loadChatInfo = async () => {
      try {
        const chatRef = doc(db, "chats", chatId)
        const chatSnap = await getDoc(chatRef)
        if (chatSnap.exists()) {
          const chatData = chatSnap.data()
          setChatInfo(chatData)

          // Check if product is already sold
          if (chatData.productId) {
            const productRef = doc(db, "items", chatData.productId)
            const productSnap = await getDoc(productRef)
            if (productSnap.exists()) {
              const productData = productSnap.data()
              setIsProductSold(productData.sold === true || productData.status === "sold")
            }
          }
        } else {
          console.error("Chat not found")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error loading chat:", error)
        setLoading(false)
      }
    }

    loadChatInfo()

    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMessages(msgs)
      setTimeout(scrollToBottom, 100)
    })

    return () => unsubscribe()
  }, [chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  //console.log(productLink)
  const handleImageUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Limit to 3 images
    const filesToUpload = Array.from(files).slice(0, 3)
    setIsUploading(true)

    try {
      const uploadedImages = []

      for (const file of filesToUpload) {
        const data = new FormData()
        data.append("file", file)
        data.append("upload_preset", "CollegeFair")
        data.append("cloud_name", "db8elhbqj")

        const res = await fetch("https://api.cloudinary.com/v1_1/db8elhbqj/image/upload", {
          method: "POST",
          body: data,
        })

        const finalData = await res.json()
        uploadedImages.push({
          url: finalData.url,
          name: file.name,
          type: file.type,
        })
      }

      setImages([...images, ...uploadedImages])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((input.trim() === "" && images.length === 0) || !currentUser) return

    try {
      const message = {
        senderId: currentUser.uid,
        text: input.trim(),
        timestamp: serverTimestamp(),
        images: images,
      }

      await addDoc(collection(db, "chats", chatId, "messages"), message)

      // Update last message text based on content
      let lastMessageText = input.trim()
      let lastMessageType = "text"

      if (images.length > 0 && input.trim() === "") {
        lastMessageText = `Sent ${images.length} image${images.length > 1 ? "s" : ""}`
        lastMessageType = "image"
      } else if (images.length > 0) {
        lastMessageText = `${input.trim()} [with ${images.length} image${images.length > 1 ? "s" : ""}]`
        lastMessageType = "mixed"
      }

      // Key fix: Include sender ID in chat update
      await updateLastMessage(chatId, lastMessageText, lastMessageType, currentUser.uid)

      setInput("")
      setImages([])
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const updateLastMessage = async (chatId, text, type = "text", senderId) => {
    try {
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageType: type,
        lastMessageSenderId: senderId, // Key fix: Track who sent the last message
        lastUpdated: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating last message:", error)
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "chats", chatId, "messages", messageId))
      setMessageToDelete(null)

      // If it was the last message, update the last message to the previous one
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.id === messageId) {
        const previousMessage = messages[messages.length - 2]
        if (previousMessage) {
          await updateLastMessage(
            chatId,
            previousMessage.text || "Sent an image",
            previousMessage.images?.length > 0 ? "image" : "text",
            previousMessage.senderId,
          )
        } else {
          // If there are no more messages
          await updateLastMessage(chatId, "No messages", "text", currentUser.uid)
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const markAsSold = async () => {
    try {
      // Update the product status in the products collection
      const productRef = doc(db, "items", chatInfo.productId)
      await updateDoc(productRef, {
        sold: true,
        status: "sold",
        soldAt: serverTimestamp(),
        soldBy: currentUser.uid,
      })

      // Also update the chat info to reflect the change
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        productSold: true,
        soldAt: serverTimestamp(),
      })

      // Update local state
      setIsProductSold(true)

      // Close the modal
      setShowMarkAsSoldModal(false)

      // Show success message or navigate back
      if (onBackClick) {
        setTimeout(() => {
          onBackClick()
        }, 1000) // Small delay to show success
      }
    } catch (error) {
      console.error("Error marking product as sold:", error)
      // You could add error handling here, like showing an error toast
    }
  }

  const getOtherUserName = () => {
    if (!chatInfo || !currentUser) return ""
    return currentUser.uid === chatInfo.buyerId ? chatInfo.sellerName : chatInfo.buyerName
  }

  const getId = ()=>{
     if (!chatInfo || !currentUser) return ""
    return currentUser.uid === chatInfo.buyerId ? chatInfo.sellerId : chatInfo.buyerId
  }
  

  const otherUserName = getOtherUserName();
  const Id  = getId();
  const avatarColor = getAvatarColor(otherUserName)

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 bg-purple-600 text-white">
          <div className="h-8 w-64 bg-white/20 animate-pulse rounded-md"></div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="h-12 w-3/4 bg-gray-100 animate-pulse rounded-2xl"></div>
          <div className="h-12 w-1/2 ml-auto bg-purple-100 animate-pulse rounded-2xl"></div>
          <div className="h-12 w-2/3 bg-gray-100 animate-pulse rounded-2xl"></div>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="h-12 w-full bg-gray-100 animate-pulse rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh] md:max-h-[80vh]">
      {/* Chat Header */}
      <div className="p-3 md:p-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-2 md:gap-3">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          <div
            className={`h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-medium shadow-lg`}
             onClick={()=>{
              navigate(`/profile/${Id}`)
             }}
          >
            {getInitials(otherUserName)}
          </div>
          <div>
            <h2   onClick={()=>{
              navigate(`/profile/${Id}`)
             }} 
             className="font-semibold text-base md:text-lg truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {otherUserName}
            </h2>
          </div>
        </div>

        {chatInfo?.productTitle && (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => {
                navigate(`/itemlist/product/${chatInfo.productId}`)
              }}
              className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1 rounded-full 
                         bg-white/20 backdrop-blur-sm truncate 
                         max-w-[100px] sm:max-w-[150px] md:max-w-[200px]
                         cursor-pointer transition duration-200 hover:bg-white/30"
            >
              {chatInfo.productTitle}
            </div>

            {/* Mark as Sold button - only show for sellers */}
            {currentUser?.uid === chatInfo.sellerId && (
              <>
                {isProductSold ? (
                  // Already sold - show sold status
                  <div
                    className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 
                                 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white 
                                 shadow-md border border-gray-300/30 backdrop-blur-sm
                                 font-medium whitespace-nowrap cursor-not-allowed opacity-75"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M9 12l2 2 4-4"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span className="hidden sm:inline">Already Sold</span>
                    <span className="sm:hidden">Sold</span>
                  </div>
                ) : (
                  // Not sold yet - show mark as sold button
                  <button
                    onClick={() => setShowMarkAsSoldModal(true)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 
                               rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white 
                               hover:from-emerald-600 hover:to-green-600 
                               active:from-emerald-700 active:to-green-700
                               shadow-lg hover:shadow-xl transform hover:scale-105 
                               transition-all duration-200 ease-in-out
                               border border-emerald-400/30 backdrop-blur-sm
                               font-medium whitespace-nowrap"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M9 12l2 2 4-4"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span className="hidden sm:inline">Mark as Sold</span>
                    <span className="sm:hidden">Sell</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-gray-50 to-white"
        ref={scrollAreaRef}
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f0f0f0' fillOpacity='0.4' fillRule='evenodd'/%3E%3C/svg%3E')",
          backgroundSize: "300px",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="font-medium text-gray-600">No messages yet</p>
            <p className="text-sm">Start the conversation with {otherUserName}!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === currentUser?.uid
            const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== msg.senderId)
            const hasImages = msg.images && msg.images.length > 0

            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[90%] xs:max-w-[85%] sm:max-w-[75%] md:max-w-[70%] group`}
                >
                  {!isMine && showAvatar ? (
                    <div
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs shadow-md flex-shrink-0`}
                    >
                      {getInitials(otherUserName)}
                    </div>
                  ) : !isMine ? (
                    <div className="w-8 flex-shrink-0"></div>
                  ) : null}

                  <div className={`space-y-1 ${isMine ? "items-end" : "items-start"} flex flex-col relative`}>
                    <div
                      className={`px-4 py-3 rounded-2xl break-words shadow-sm relative ${
                        isMine
                          ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-br-none"
                          : "bg-white border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      {msg.text && <div className="mb-2">{msg.text}</div>}

                      {hasImages && (
                        <div className={`grid ${msg.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-2`}>
                          {msg.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt={`Image ${imgIndex + 1}`}
                                className="rounded-lg max-h-40 w-full object-cover cursor-pointer"
                                onClick={() => window.open(image.url, "_blank")}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {isMine && (
                        <button
                          onClick={() => setMessageToDelete(msg.id)}
                          className={`absolute -top-2 -right-2 p-1.5 rounded-full bg-white shadow-md text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity touch-action-manipulation`}
                          aria-label="Delete message"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="bg-gray-50 p-2 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Preview ${index}`}
                  className="h-16 w-16 object-cover rounded-md border border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-100 shadow-inner">
        <form onSubmit={sendMessage} className="flex gap-2 items-center">
          <label
            className={`p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-colors cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            htmlFor="image-upload"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading || images.length >= 3}
              ref={fileInputRef}
            />
          </label>

          <div className="flex-1 relative">
            <input
              className="w-full border-0 bg-gray-100 rounded-full px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              placeholder={images.length > 0 ? "Add a message or send images..." : "Type a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-2 md:p-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={(input.trim() === "" && images.length === 0) || isUploading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Delete Message</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMessage(messageToDelete)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Sold Confirmation Modal */}
      {showMarkAsSoldModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-600"
              >
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2 text-gray-800">Mark as Sold</h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Do you want this item to be marked as sold? This item will be removed from the item list and marked as
              unavailable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowMarkAsSoldModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 
                     hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                     font-medium"
              >
                Cancel
              </button>
              <button
                onClick={markAsSold}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 
                     text-white rounded-xl hover:from-emerald-600 hover:to-green-600 
                     shadow-lg hover:shadow-xl transform hover:scale-105 
                     transition-all duration-200 font-medium"
              >
                Yes, Mark as Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Uploading images...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatRoom
