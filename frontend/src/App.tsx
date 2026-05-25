import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import WrongQuestions from './pages/WrongQuestions'
import './index.css'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz"
            element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />}
          />
          <Route
            path="/wrong-questions"
            element={isAuthenticated ? <WrongQuestions /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
