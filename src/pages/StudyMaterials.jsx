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
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage'
import { db, storage } from '../firebase'
import { FaPlus, FaTimes, FaSearch, FaDownload, FaFile } from 'react-icons/fa'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

function StudyMaterials() {
  const { currentUser } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  
  // New material form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  useEffect(() => {
    fetchMaterials()
  }, [])
  
  async function fetchMaterials() {
    try {
      setLoading(true)
      const materialsQuery = query(
        collection(db, 'studyMaterials'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(materialsQuery)
      const materialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMaterials(materialsData)
    } catch (error) {
      console.error('Error fetching study materials:', error)
    } finally {
      setLoading(false)
    }
  }
  
  function handleFileChange(e) {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  async function handleAddMaterial(e) {
    e.preventDefault()
    
    if (!file) return
    
    try {
      setIsUploading(true)
      
      // Create a unique file name
      const fileExtension = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const storageRef = ref(storage, `studyMaterials/${fileName}`)
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Error uploading file:', error)
          setIsUploading(false)
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          // Add document to Firestore
          await addDoc(collection(db, 'studyMaterials'), {
            title,
            description,
            subject,
            fileURL: downloadURL,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            createdAt: serverTimestamp(),
            uploadedBy: currentUser.displayName,
            uploaderId: currentUser.uid
          })
          
          // Reset form and close modal
          setTitle('')
          setDescription('')
          setSubject('')
          setFile(null)
          setUploadProgress(0)
          setIsUploading(false)
          setShowAddModal(false)
          
          // Refresh materials
          fetchMaterials()
        }
      )
    } catch (error) {
      console.error('Error adding study material:', error)
      setIsUploading(false)
    }
  }
  
  // Filter and search materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          material.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && material.subject === filter
  })
  
  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Literature', 'History', 'Economics']
  
  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
          <p className="text-gray-600">Share and download study resources</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center mt-4 md:mt-0"
        >
          <FaPlus className="mr-2" />
          Upload Material
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
                placeholder="Search materials..."
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
              <option value="all">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading study materials...</p>
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(material => (
            <div key={material.id} className="card">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">{material.title}</h2>
                <p className="text-sm text-primary-600 mt-1">{material.subject}</p>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaFile className="mr-2" />
                  <span className="truncate">{material.fileName}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>{formatFileSize(material.fileSize)}</span>
                  <span>
                    {material.createdAt ? format(material.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    By {material.uploadedBy}
                  </span>
                  
                  <a
                    href={material.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-sm py-1 px-3 flex items-center"
                    download
                  >
                    <FaDownload className="mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No study materials found</p>
        </div>
      )}
      
      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Upload Study Material</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddMaterial} className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  id="title"
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  className="input min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isUploading}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                <select
                  id="subject"
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={isUploading}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="file" className="block text-gray-700 font-medium mb-2">File</label>
                <input
                  id="file"
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                  onChange={handleFileChange}
                  required
                  disabled={isUploading}
                />
                {file && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected file: {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>
              
              {isUploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Uploading: {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading || !file}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyMaterials