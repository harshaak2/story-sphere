import React, { useEffect, useState } from 'react';
import PostCard from "../components/PostCard";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/post/getposts');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data && data.posts) {
          setPosts(data.posts);
          setShowMore(data.posts.length >= 9);
        } else {
          setPosts([]);
          setShowMore(false);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    try {
      const res = await fetch(`/api/post/getposts`);
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      if (data && data.posts) {
        setPosts([...posts, ...data.posts]);
        setShowMore(data.posts.length >= 9);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3">
      <h1 className="text-3xl font-semibold text-center my-7">All Posts</h1>
      <div className="flex flex-wrap gap-4 justify-center">
        {!loading && posts.length === 0 && (
          <p className="text-xl text-gray-500">No posts found.</p>
        )}
        {loading && <p className="text-xl text-gray-500">Loading...</p>}
        {!loading &&
          posts &&
          posts.map((post, index) => <PostCard post={post} key={index} />)}
      </div>
      {showMore && (
        <div className="flex justify-center my-7">
          <button
            onClick={handleShowMore}
            className="text-teal-500 hover:underline text-lg"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}