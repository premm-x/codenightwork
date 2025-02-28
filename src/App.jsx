import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NoticeBoard from './pages/NoticeBoard'
import StudyMaterials from './pages/StudyMaterials'
import Chat from './pages/Chat'
import EventCalendar from './pages/EventCalendar'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import HomePage from './pages/Home/HomePage'
import Dashboardteacher from './pages/Teacher/Dashboard.teacher'
import TeacherLayout from './layouts/TeacherLayout'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      
      <Route path='/' element={ <HomePage/> } />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/student/login" element={<Login />} />
        <Route path="/student/register" element={<Register />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notices" element={<NoticeBoard />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/events" element={<EventCalendar />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={ <TeacherLayout/> }>
        <Route path='/teacher/dashboard' element={<Dashboardteacher/>} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App