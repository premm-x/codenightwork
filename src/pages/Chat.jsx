import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { FaPaperPlane, FaUser, FaUsers } from 'react-icons/fa'
import { format } from 'date-fns'

function Chat() {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [selectedChat, setSelectedChat] = useState('general')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'))
        const querySnapshot = await getDocs(usersQuery)
        const usersData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.id !== currentUser.uid)
        
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    
    fetchUsers()
  }, [currentUser])
  
  // Listen for messages
  useEffect(() => {
    setLoading(true)
    
    let messagesQuery
    
    if (selectedChat === 'general') {
      // General chat
      messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', 'general'),
        orderBy('createdAt')
      )
    } else {
      // Private chat - get messages where the chatId contains both user IDs
      const chatId1 = `${currentUser.uid}_${selectedChat}`
      const chatId2 = `${selectedChat}_${currentUser.uid}`
      
      messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', 'in', [chatId1, chatId2]),
        orderBy('createdAt')
      )
    }
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(messagesData)
      setLoading(false)
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })
    
    return () => unsubscribe()
  }, [selectedChat, currentUser])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  async function handleSendMessage(e) {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    try {
      let chatId
      
      if (selectedChat === 'general') {
        chatId = 'general'
      } else {
        // For private chats, create a chatId using both user IDs
        chatId = `${currentUser.uid}_${selectedChat}`
      }
      
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL || '',
        chatId
      })
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  
  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="flex flex-col md:flex-row h-full gap-4">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Conversations</h2>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <div className="p-2">
              <button
                onClick={() => setSelectedChat('general')}
                className={`flex items-center w-full p-3 rounded-lg ${
                  selectedChat === 'general' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="rounded-full bg-primary-200 p-2 mr-3">
                  <FaUsers className="text-primary-700" />
                </div>
                <div className="text-left">
                  <p className="font-medium">General Chat</p>
                  <p className="text-xs text-gray-500">Everyone</p>
                </div>
              </button>
              
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedChat(user.id)}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    selectedChat === user.id 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="rounded-full bg-gray-200 p-2 mr-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="h-5 w-5 rounded-full" />
                    ) : (
                      <FaUser className="text-gray-700" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.department || 'Student'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">
              {selectedChat === 'general' 
                ? 'General Chat' 
                : users.find(u => u.id === selectedChat)?.displayName || 'Chat'}
            </h2>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map(msg => {
                  const isCurrentUser = msg.uid === currentUser.uid
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                          isCurrentUser 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        {!isCurrentUser && (
                          <p className="text-xs font-medium text-primary-600 mb-1">
                            {msg.displayName}
                          </p>
                        )}
                        <p>{msg.text}</p>
                        <p 
                          className={`text-xs mt-1 text-right ${
                            isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {msg.createdAt ? format(msg.createdAt.toDate(), 'h:mm a') : 'Sending...'}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat