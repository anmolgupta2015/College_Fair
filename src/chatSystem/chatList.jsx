"use client"

import { useState, useEffect } from "react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore"
import { formatTimeAgo, getInitials, getAvatarColor } from "./chatUtils"
import { useNavigate } from "react-router-dom"

const db = getFirestore()

const ChatList = ({ currentUser, selectedChatId, onChatSelect }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadChats = async () => {
      try {
        const buyerQuery = query(collection(db, "chats"), where("buyerId", "==", currentUser.uid))
        const sellerQuery = query(collection(db, "chats"), where("sellerId", "==", currentUser.uid))

        const [buyerSnapshot, sellerSnapshot] = await Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)])

        const buyerChats = buyerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        const sellerChats = sellerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        const chatMap = new Map()
        ;[...buyerChats, ...sellerChats].forEach((chat) => {
          chatMap.set(chat.id, chat)
        })

        const allChats = Array.from(chatMap.values())

        const unsubscribes = []

        allChats.forEach((chat) => {
          const chatUnsubscribe = onSnapshot(doc(db, "chats", chat.id), (chatDoc) => {
            if (chatDoc.exists()) {
              const updatedChatData = { id: chatDoc.id, ...chatDoc.data() }

              setChats((prevChats) => {
                const newChats = prevChats.map((c) => (c.id === chat.id ? { ...c, ...updatedChatData } : c))
                return newChats.sort((a, b) => {
                  if (!a.lastUpdated || !b.lastUpdated) return 0
                  const aTime = a.lastUpdated instanceof Date ? a.lastUpdated : a.lastUpdated?.toDate()
                  const bTime = b.lastUpdated instanceof Date ? b.lastUpdated : b.lastUpdated?.toDate()
                  return bTime - aTime
                })
              })
            }
          })

          // Listen to read status changes
          const readStatusUnsubscribe = onSnapshot(
            doc(db, "chats", chat.id, "readStatus", currentUser.uid),
            (readDoc) => {
              const lastReadAt = readDoc.exists() ? readDoc.data().lastReadAt?.toDate() : null

              // Update read status for this specific chat
              setChats((prevChats) =>
                prevChats.map((c) => {
                  if (c.id === chat.id) {
                    const lastUpdated = c.lastUpdated instanceof Date ? c.lastUpdated : c.lastUpdated?.toDate()

                    // Key fix: Don't mark as unread if the last message was sent by current user
                    const isUnread =
                      lastReadAt && lastUpdated && c.lastMessageSenderId !== currentUser.uid
                        ? lastUpdated > lastReadAt
                        : c.lastMessageSenderId !== currentUser.uid && !!lastUpdated

                    return { ...c, isUnread, lastReadAt }
                  }
                  return c
                }),
              )
            },
          )

          unsubscribes.push(chatUnsubscribe, readStatusUnsubscribe)
        })

        const enrichedChats = await Promise.all(
          allChats.map(async (chat) => {
            const readRef = doc(db, "chats", chat.id, "readStatus", currentUser.uid)
            const readSnap = await getDoc(readRef)

            const lastReadAt = readSnap.exists()
              ? readSnap.data().lastReadAt instanceof Date
                ? readSnap.data().lastReadAt
                : readSnap.data().lastReadAt?.toDate?.()
              : null

            const lastUpdated = chat.lastUpdated instanceof Date ? chat.lastUpdated : chat.lastUpdated?.toDate?.()

            const isUnread =
              chat.lastMessageSenderId !== currentUser.uid &&
              ((lastReadAt && lastUpdated && lastUpdated > lastReadAt) || (!lastReadAt && lastUpdated))

            return { ...chat, isUnread, lastUpdated, lastReadAt }
          }),
        )

        enrichedChats.sort((a, b) => {
          const dateA = a.lastUpdated instanceof Date ? a.lastUpdated : null
          const dateB = b.lastUpdated instanceof Date ? b.lastUpdated : null

          if (!dateA && !dateB) return 0
          if (!dateA) return 1 // nulls last
          if (!dateB) return -1

          return dateB - dateA // descending order
        })

        setChats(enrichedChats)
        setTimeout(
          () => {
            setLoading(false)
          },
          Math.max(500, 0),
        ) // Minimum 500ms loading time

        // Cleanup function
        return () => {
          unsubscribes.forEach((unsubscribe) => unsubscribe())
        }
      } catch (error) {
        console.error("Error loading chats:", error)
        setTimeout(
          () => {
            setLoading(false)
          },
          Math.max(500, 0),
        )
      }
    }

    const cleanup = loadChats()

    return () => {
      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((cleanupFn) => cleanupFn && cleanupFn())
      }
    }
  }, [currentUser])

  // Mark selected chat as read immediately when selected
  useEffect(() => {
    if (selectedChatId && currentUser) {
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === selectedChatId ? { ...chat, isUnread: false } : chat)),
      )
    }
  }, [selectedChatId, currentUser])

  const getOtherUserName = (chat) => {
    if (!currentUser || !chat) return ""
    return currentUser.uid === chat.buyerId ? chat.sellerName : chat.buyerName
  }

  const filteredChats = chats.filter((chat) => {
    const otherUserName = getOtherUserName(chat)
    return (
      otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.productTitle && chat.productTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-purple-600 text-white">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>

      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-2.5 text-gray-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 min-h-[400px]">
            <div className="flex items-center justify-center w-16 h-16 mb-4">
              <svg
                className="animate-spin h-8 w-8 text-purple-600"
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
            </div>
            <p className="text-gray-600 font-medium">Loading conversations...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your messages</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mb-6">
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
                className="text-purple-600"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M13 8l-3 3 3 3"></path>
              </svg>
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search terms or browse all conversations</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Start Your First Conversation!</h3>
                <p className="text-gray-600 mb-4 max-w-sm leading-relaxed">
                  Connect with sellers and buyers instantly. Browse products and click the
                  <span className="inline-flex items-center mx-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                    💬 Chat
                  </span>
                  icon to start chatting.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium" onClick={()=>{navigate('/itemlist')}}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                  </svg>
                  Explore products to get started
                </div>
              </>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUserName = getOtherUserName(chat)
            const avatarColor = getAvatarColor(otherUserName)
            const isSelected = selectedChatId === chat.id
            const hasImage = chat.lastMessageType === "image"

            return (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`flex items-start p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-all duration-200 ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : chat.isUnread
                      ? "border-purple-400 bg-purple-50/40"
                      : "border-transparent"
                } ${chat.isUnread ? "shadow-sm" : ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-medium text-lg shadow-sm flex-shrink-0`}
                >
                  {getInitials(otherUserName)}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className={`truncate ${chat.isUnread ? "text-black font-semibold" : "text-gray-900"}`}>
                      {otherUserName}
                    </h3>
                    <div className="flex items-center gap-2">
                      {chat.isUnread && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center justify-center w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {chat.lastUpdated ? formatTimeAgo(chat.lastUpdated) : ""}
                      </span>
                    </div>
                  </div>

                  {chat.productTitle && (
                    <p className="text-xs text-purple-600 font-medium truncate mt-0.5">{chat.productTitle}</p>
                  )}

                  <p
                    className={`text-sm truncate mt-0.5 ${
                      chat.isUnread ? "text-gray-800 font-medium" : "text-gray-500"
                    }`}
                  >
                    {hasImage ? (
                      <span className="flex items-center">
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
                          className="mr-1"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        Image
                      </span>
                    ) : (
                      chat.lastMessage || "No messages yet"
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default ChatList
