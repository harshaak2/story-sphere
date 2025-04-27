import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, Button } from "flowbite-react";
import { WandSparkles, X, AlertCircle } from "lucide-react";

import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summarizingPost, setSummarizingPost] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const modalRef = useRef(null);
  const errorModalRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleSummarizePost = async () => {
    if (!post || !post.content) return;

    try {
      setSummarizingPost(true);
      setSummaryError(null);
      setShowErrorModal(false);

      const res = await fetch('/api/ai/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: post.content }),
      });

      const data = await res.json();
      console.log("Summary data:", data);

      if (!res.ok) {
        console.error("Error summarizing post:", data.error || data.message);
        setSummaryError(data.error || data.message || "Failed to summarize the post");
        setSummarizingPost(false);
        setShowErrorModal(true);
        return;
      }

      // Process the summary data which is an object
      setSummary(data);
      setShowModal(true);
      setSummarizingPost(false);
    } catch (error) {
      console.error("Error summarizing post:", error);
      setSummaryError(error.message || "Failed to summarize the post");
      setSummarizingPost(false);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
      if (errorModalRef.current && !errorModalRef.current.contains(event.target)) {
        setShowErrorModal(false);
      }
    };

    if (showModal || showErrorModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal, showErrorModal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button color="gray" pill size="xs">
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex justify-between items-center p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <Button 
          className="flex gap-2 items-center"
          onClick={handleSummarizePost}
          disabled={summarizingPost}
        > 
          {summarizingPost ? (
            <div className="flex items-center text-xs">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span>Summarizing...</span>
            </div>
          ) : (
            <div className="flex items-center text-xs">
              <WandSparkles className="w-3 h-3 mr-1" /> 
              <span>Summarize</span>
            </div>
          )}
        </Button>
        <span className="italic">
          {post && Math.ceil(post.content.length / 1000)} mins read
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Summary of "{post.title}"
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {summary && (
                <div className="flex flex-col gap-4">
                  {/* Handle nested summary structure from the API */}
                  {summary.summary ? (
                    <>
                      {summary.summary.headline && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Headline</h4>
                          <p className="text-gray-700 dark:text-gray-300">{summary.summary.headline}</p>
                        </div>
                      )}

                      {summary.summary.summary_text && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Summary</h4>
                          <p className="text-gray-700 dark:text-gray-300">{summary.summary.summary_text}</p>
                        </div>
                      )}

                      {summary.summary.key_points && Array.isArray(summary.summary.key_points) && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Key Points</h4>
                          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                            {summary.summary.key_points.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </>
                  ) : (
                    /* Handle direct properties if data structure is different */
                    <>
                      {summary.headline && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Headline</h4>
                          <p className="text-gray-700 dark:text-gray-300">{summary.headline}</p>
                        </div>
                      )}

                      {summary.summary_text && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Summary</h4>
                          <p className="text-gray-700 dark:text-gray-300">{summary.summary_text}</p>
                        </div>
                      )}

                      {summary.key_points && Array.isArray(summary.key_points) && (
                        <div>
                          <h4 className="font-bold text-lg mb-1">Key Points</h4>
                          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                            {summary.key_points.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </>
                  )}

                  {/* Fallback for string data */}
                  {!summary.summary && !summary.summary_text && typeof summary === 'string' && (
                    <p className="text-gray-700 dark:text-gray-300">{summary}</p>
                  )}
                </div>
              )}
              
              {!summary && (
                <p className="text-gray-700 dark:text-gray-300">No summary available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div 
            ref={errorModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> 
                Summarization Error
              </h3>
              <button 
                onClick={() => setShowErrorModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {summaryError || "There was an error summarizing this post. Please try again."}
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  color="gray"
                  onClick={() => setShowErrorModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="failure"
                  onClick={() => {
                    setShowErrorModal(false);
                    handleSummarizePost();
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <div className="max-w-4xl mx-auto w-full">
        <CallToAction />
      </div>
      <CommentSection postID={post._id} />
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent Articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
}
