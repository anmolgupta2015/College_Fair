"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import ChatList from "./chatList"
import ChatRoom from "./chatRoom"

const auth = getAuth()

const ChatInterface = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  // Mobile: Show chat list when no chat selected, show chat room when chat selected
  // Desktop: Show both side by side
  if (isMobile) {
    return (
      <div className="flex h-screen bg-gray-50">
        {!selectedChat ? (
          // Show only chat list on mobile when no chat selected
          <div className="w-full bg-white flex flex-col h-full">
            <ChatList currentUser={currentUser} selectedChatId={selectedChat} onChatSelect={handleChatSelect} />
          </div>
        ) : (
          // Show only chat room on mobile when chat selected
          <div className="w-full flex flex-col h-full">
            <ChatRoom chatId={selectedChat} currentUser={currentUser} onBackClick={handleBackToList} />
          </div>
        )}
      </div>
    )
  }

  // Desktop layout: Show both chat list and chat room side by side
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full">
        <ChatList currentUser={currentUser} selectedChatId={selectedChat} onChatSelect={handleChatSelect} />
      </div>

      {/* Chat Room */}
      <div className="w-2/3 lg:w-3/4 flex flex-col h-full">
        {!selectedChat ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-4">
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
                className="text-purple-600"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Select a conversation</h2>
            <p className="text-gray-500 max-w-sm">Choose a conversation from the list to start chatting</p>
          </div>
        ) : (
          <ChatRoom chatId={selectedChat} currentUser={currentUser} onBackClick={null} />
        )}
      </div>
    </div>
  )
}

export default ChatInterface
