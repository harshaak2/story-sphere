import React from 'react'

export default function About() {
  return (
    <div className='flex items-center justify-center min-h-screen '>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div> 
          <h1 className='text-3xl font-semibold text-center my-7'>About StorySphere</h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'  >
            <p>Welcome to StorySphere, where the art of storytelling meets modern digital expression. Dive into a rich tapestry of blog posts spanning diverse topics curated by our vibrant community of writers and enthusiasts. Whether you're here to explore the latest in technology, delve into personal anecdotes, or seek inspiration for your next adventure, StorySphere offers an immersive reading experience tailored to your interests.</p>
            <p>For writers, StorySphere provides a seamless platform to share your voice with the world. Our intuitive editor and robust publishing tools empower you to craft compelling narratives enriched with multimedia content. With features like responsive design using TailwindCSS and Flowbite-React, along with state-of-the-art Redux for smooth navigation and Redis caching for enhanced performance, StorySphere ensures that your stories reach audiences seamlessly across all devices.</p>
            <p>Whether you're a reader or a writer, join our community today and embark on a journey where every story finds its sphere.</p>
            <p>If you have any issues, contact the developer at <span className='font-semibold text-neutral-300'>sriharshakurra15@gmail.com</span></p>
            <p className="text-xl text-neutral-200">Thank You for visiting!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
