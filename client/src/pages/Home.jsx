import React from 'react'
import HomeHeader from '../components/HomeHeader'
import FeaturedDestination from '../components/featuredDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import NewsLetter from '../components/NewsLetter'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <HomeHeader/>
      <FeaturedDestination/>
      <ExclusiveOffers />
      <Testimonial/>
      <NewsLetter/>
      
    </>
  )
}

export default Home

