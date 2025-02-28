import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import { FaPlus, FaTimes, FaSearch } from 'react-icons/fa'
import { format } from 'date-fns'

function NoticeBoard() {
  const { currentUser } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  
  // New notice form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [department, setDepartment] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  
  useEffect(() => {
    fetchNotices()
  }, [])
  
  async function fetchNotices() {
    try {
      setLoading(true)
      const noticesQuery = query(
        collection(db, 'notices'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(noticesQuery)
      const noticesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotices(noticesData)
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleAddNotice(e) {
    e.preventDefault()
    
    try {
      await addDoc(collection(db, 'notices'), {
        title,
        content,
        department,
        isImportant,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        authorName: currentUser.displayName
      })
      
      // Reset form and close modal
      setTitle('')
      setContent('')
      setDepartment('')
      setIsImportant(false)
      setShowAddModal(false)
      
      // Refresh notices
      fetchNotices()
    } catch (error) {
      console.error('Error adding notice:', error)
    }
  }
  
  // Filter and search notices
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'important') return matchesSearch && notice.isImportant
    return matchesSearch && notice.department === filter
  })
  
  const departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science']
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notice Board</h1>
          <p className="text-gray-600">Stay updated with the latest announcements</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center mt-4 md:mt-0"
        >
          <FaPlus className="mr-2" />
          Post Notice
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notices..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="important">Important Only</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading notices...</p>
        </div>
      ) : filteredNotices.length > 0 ? (
        <div className="space-y-4">
          {filteredNotices.map(notice => (
            <div 
              key={notice.id} 
              className={`card p-4 ${notice.isImportant ? 'border-l-4 border-red-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-800">{notice.title}</h2>
                {notice.isImportant && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Important
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mt-2 whitespace-pre-line">{notice.content}</p>
              
              <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-sm font-medium text-primary-600">
                    {notice.department}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">
                  <span>Posted by {notice.authorName} • </span>
                  <span>
                    {notice.createdAt ? format(notice.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No notices found</p>
        </div>
      )}
      
      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Post a Notice</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddNotice} className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  id="title"
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 font-medium mb-2">Content</label>
                <textarea
                  id="content"
                  className="input min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="department" className="block text-gray-700 font-medium mb-2">Department</label>
                <select
                  id="department"
                  className="input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Mark as important</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NoticeBoard