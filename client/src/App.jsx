import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import Footer from './components/Footer.jsx'
import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import {Toaster} from 'react-hot-toast'

const App = () => {
  const isSellerPath = useLocation().pathname.includes('seller');
  return (
    <div>
      {isSellerPath ? null : <NavBar />}

      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
      
      {isSellerPath ? null : <Footer />}
    </div>
  )
}

export default App
