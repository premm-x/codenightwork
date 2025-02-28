import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaBars, FaBell, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Campus Connect
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
              <FaBell className="h-5 w-5" />
            </button>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 text-sm rounded-full focus:outline-none"
                >
                  <span className="hidden md:block">{currentUser?.displayName}</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                </button>
              </div>
              
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowProfileMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/notices" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Notice Board
            </Link>
            <Link 
              to="/study-materials" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Study Materials
            </Link>
            <Link 
              to="/chat" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Chat
            </Link>
            <Link 
              to="/events" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Events
            </Link>
            <Link 
              to="/profile" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout()
                setShowMobileMenu(false)
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar