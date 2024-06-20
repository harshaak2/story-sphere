import React from 'react'
import { Button } from 'flowbite-react'

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl'>
      <div className='flex-1 justify-center flex flex-col items-center'>
        <h2 className='text-2xl'>Want to learn more?</h2>
        <p className='text-gray-500 my-2'>Checkout the blogs as per your interest!</p>
        <Button gradientDuoTone={'purpleToPink'} className='rounded-tl-xl rounded-bl-none'>Learn More</Button>
      </div>
      <div className='p-7 flex-1' >
        <img src="https://fjwp.s3.amazonaws.com/blog/wp-content/uploads/2018/12/27082207/Freelancers.png" alt="img" />
      </div>
    </div>
  )
}
