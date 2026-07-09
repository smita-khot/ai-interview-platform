import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* We'll add /login, /register, /dashboard etc. in upcoming days */}
    </Routes>
  )
}

export default App
