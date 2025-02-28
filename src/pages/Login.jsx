import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaEnvelope, FaLock } from 'react-icons/fa'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="card p-6 w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="text-gray-600">Sign in to continue to Campus Connect</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full mb-4"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-primary-600 hover:text-primary-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login