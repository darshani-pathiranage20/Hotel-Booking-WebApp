import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { useLocation, Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBooking from './pages/MyBooking'
import HotelReg from './components/HotelReg'
import Layout from './pages/HotelOwner/Layout'
import Dashboard from './pages/HotelOwner/Dashboard'
import AddRoom from './pages/HotelOwner/AddRoom'
import ListRoom from './pages/HotelOwner/ListRoom'


const App = () => {

const isOwnerPath = useLocation().pathname.includes("owner");

  return (
    <div>
      {!isOwnerPath && <Navbar/>}
      {false && <HotelReg />}
      
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/rooms' element={<AllRooms/>} />
          <Route path='/rooms/:id' element={<RoomDetails/>} />
          <Route path='/my-bookings' element={<MyBooking/>} />
          {/* owner */}
          <Route path='/owner' element={<Layout/>} >
              <Route index element={<Dashboard/>} />
              <Route path='add-room' element={<AddRoom/>} />
              <Route path='list-room' element={<ListRoom/>} />
          </Route>

        </Routes>
      </div>
      <Footer/>
    </div>
  )
}

export default App
