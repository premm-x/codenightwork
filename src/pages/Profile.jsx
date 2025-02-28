import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { db, storage } from '../firebase'
import { FaUser, FaEdit } from 'react-icons/fa'

function Profile() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          
          // Initialize form state
          setDisplayName(data.displayName || '')
          setDepartment(data.department || '')
          setYear(data.year || '')
          setBio(data.bio || '')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [currentUser])
  
  function handleImageChange(e) {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }
  
  async function handleUpdateProfile(e) {
    e.preventDefault()
    
    try {
      setUpdating(true)
      const userRef = doc(db, 'users', currentUser.uid)
      
      // Update data object
      const updatedData = {
        displayName,
        department,
        year,
        bio
      }
      
      // Upload profile image if selected
      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${currentUser.uid}`)
        const uploadTask = uploadBytesResumable(storageRef, profileImage)
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(progress)
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              updatedData.photoURL = downloadURL
              
              // Update auth profile
              await updateProfile(currentUser, {
                displayName,
                photoURL: downloadURL
              })
              
              resolve()
            }
          )
        })
      } else {
        // Update auth profile without photo
        await updateProfile(currentUser, {
          displayName
        })
      }
      
      // Update Firestore document
      await updateDoc(userRef, updatedData)
      
      // Update local state
      setUserData(prev => ({ ...prev, ...updatedData }))
      setIsEditing(false)
      setProfileImage(null)
      setUploadProgress(0)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setUpdating(false)
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>
      
      <div className="card">
        {!isEditing ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4 overflow-hidden">
                  {userData?.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.displayName} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaUser className="h-8 w-8" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{userData?.displayName}</h2>
                  <p className="text-gray-600">{userData?.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                <p className="text-gray-800">{userData?.department || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Year </h3>
                <p className="text-gray-800">{userData?.year || 'Not specified'}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                <p className="text-gray-800 whitespace-pre-line">{userData?.bio || 'No bio provided'}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="mb-6 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4 overflow-hidden">
                {profileImage ? (
                  <img 
                    src={URL.createObjectURL(profileImage)} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.displayName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser className="h-10 w-10" />
                )}
              </div>
              
              <label className="btn btn-outline text-sm">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              
              {profileImage && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {profileImage.name}
                </p>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full max-w-xs mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary-600 h-1.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="displayName" className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  id="displayName"
                  type="text"
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input bg-gray-50"
                  value={userData?.email}
                  disabled
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="department" className="block text-gray-700 font-medium mb-2">Department</label>
                <input
                  id="department"
                  type="text"
                  className="input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-gray-700 font-medium mb-2">Year</label>
                <select
                  id="year"
                  className="input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Fourth Year">Fourth Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">Bio</label>
              <textarea
                id="bio"
                className="input min-h-[120px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile