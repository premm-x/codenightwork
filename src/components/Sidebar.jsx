import { NavLink } from 'react-router-dom'
import { FaHome, FaBullhorn, FaBook, FaComments, FaCalendarAlt } from 'react-icons/fa'

function Sidebar() {
  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/notices', icon: <FaBullhorn />, label: 'Notice Board' },
    { path: '/study-materials', icon: <FaBook />, label: 'Study Materials' },
    { path: '/chat', icon: <FaComments />, label: 'Chat' },
    { path: '/events', icon: <FaCalendarAlt />, label: 'Events' }
  ]
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center p-3 text-base font-medium rounded-lg ${
                    isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="w-6 h-6 flex items-center justify-center mr-3">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar