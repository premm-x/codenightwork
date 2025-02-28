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
import { FaPlus, FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { format, parseISO, isToday, isTomorrow, isThisWeek, isAfter } from 'date-fns'

function EventCalendar() {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('upcoming')
  
  // New event form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  
  useEffect(() => {
    fetchEvents()
  }, [])
  
  async function fetchEvents() {
    try {
      setLoading(true)
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('date', 'asc')
      )
      const querySnapshot = await getDocs(eventsQuery)
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleAddEvent(e) {
    e.preventDefault()
    
    try {
      // Combine date and time
      const eventDateTime = `${date}T${time}`
      
      await addDoc(collection(db, 'events'), {
        title,
        description,
        date: eventDateTime,
        location,
        category,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        organizerName: currentUser.displayName
      })
      
      // Reset form and close modal
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      setLocation('')
      setCategory('')
      setShowAddModal(false)
      
      // Refresh events
      fetchEvents()
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }
  
  // Filter events
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.date)
    const today = new Date()
    
    switch (filter) {
      case 'today':
        return isToday(eventDate)
      case 'tomorrow':
        return isTomorrow(eventDate)
      case 'thisWeek':
        return isThisWeek(eventDate) && !isToday(eventDate) && !isTomorrow(eventDate)
      case 'upcoming':
        return isAfter(eventDate, today)
      case 'all':
        return true
      default:
        return event.category === filter
    }
  })
  
  const categories = ['Academic', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event Calendar</h1>
          <p className="text-gray-600">Stay updated with campus events</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center mt-4 md:mt-0"
        >
          <FaPlus className="mr-2" />
          Add Event
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'upcoming' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'today' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('tomorrow')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'tomorrow' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilter('thisWeek')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'thisWeek' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === cat 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map(event => {
            const eventDate = parseISO(event.date)
            const isEventToday = isToday(eventDate)
            const isEventTomorrow = isTomorrow(eventDate)
            
            return (
              <div key={event.id} className="card overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/4 bg-primary-50 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        {isEventToday 
                          ? 'Today' 
                          : isEventTomorrow 
                            ? 'Tomorrow' 
                            : format(eventDate, 'EEEE')}
                      </p>
                      <p className="text-3xl font-bold text-primary-700">
                        {format(eventDate, 'd')}
                      </p>
                      <p className="text-lg font-medium text-gray-700">
                        {format(eventDate, 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-3/4 p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">{event.title}</h2>
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {event.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-2">{event.description}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-2" />
                        {format(eventDate, 'h:mm a')}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-2" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Organized by {event.organizerName}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No events found</p>
        </div>
      )}
      
      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Event</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Event Title</label>
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
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  className="input min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Date</label>
                  <input
                    id="date"
                    type="date"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-gray-700 font-medium mb-2">Time</label>
                  <input
                    id="time"
                    type="time"
                    className="input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Location</label>
                <input
                  id="location"
                  type="text"
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  id="category"
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventCalendar