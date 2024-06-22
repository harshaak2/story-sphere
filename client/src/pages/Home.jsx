import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import CallToAction from '../components/CallToAction'
import PostCard from '../components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getposts')
      const data = await res.json()
      setPosts(data.posts)  
    }
    fetchPosts();
  }, [])
  return (
    <div>
        <div className='flex flex-col gap-6 lg:p-28 p-3 max-w-6xl mx-auto'>
          <h1 className='text-3xl font-bold lg:text-6xl'>Welcome to Blog</h1>
          <p className='text-gray-500 text-xs sm:text-sm'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Recusandae aliquid tempore libero cupiditate dolorum possimus rerum illo iusto velit perferendis eum consequatur voluptate temporibus, perspiciatis quia inventore quae suscipit a provident sed ipsam culpa? Beatae quibusdam voluptas quis dolores cum.</p>
          <Link to='/search' className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'>View all  Posts</Link>
        </div>
        <div className='p-3 bg-amber-100 dark:bg-slate-700'>
          <CallToAction />
        </div>
        <div className="mx-auto max-w-6xl flex flex-col gap-8 py-7">
          {
            posts && posts.length > 0 && (
              <div className='flex flex-col gap-6'>
                <h2 className='text-2xl font-semibold text-center'>Recent Posts</h2>
                <div className='flex flex-wrap gap-4 mx-auto'>
                  {posts.map((post, index) => (
                    <PostCard key={index} post={post} />
                  ))}
                </div>
                <Link to='/search' className='text-teal-500 text-lg hover:underline text-center'>View all posts</Link>
              </div>
            )
          }
        </div>
    </div>
  )
}
