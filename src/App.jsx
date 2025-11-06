import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, MessageSquare } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIChat = lazy(() => import('./pages/AIChat'))

// Loading component
function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  )
}

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-600">Pakistan Trade Intelligence</h1>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/ai-chat"
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/ai-chat') 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              AI Experts
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function AppContent() {
  const location = useLocation()
  
  return (
    <main className={location.pathname === '/' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-chat" element={<AIChat />} />
        </Routes>
      </Suspense>
    </main>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AppContent />
      </div>
    </ErrorBoundary>
  )
}

export default App
