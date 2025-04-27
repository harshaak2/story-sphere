import { Button, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";

export default function 
Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "Uncategorized",
  });
  // console.log(sidebarData);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromURL = urlParams.get("searchTerm") || "";
    const sortFromURL = urlParams.get("sort");
    const categoryFromURL = urlParams.get("category");
    if (!searchTermFromURL) {
      urlParams.set("searchTerm", "");
    }
    if (searchTermFromURL || sortFromURL || categoryFromURL) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromURL,
        sort: sortFromURL,
        category: categoryFromURL,
      });
    }
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
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
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({
        ...sidebarData,
        searchTerm: e.target.value,
      });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({
        ...sidebarData,
        sort: order,
      });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "Uncategorized";
      setSidebarData({
        ...sidebarData,
        category: category,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    if (sidebarData.searchTerm.trim() === "") {
      urlParams.delete("searchTerm");
    } else {
      urlParams.set("searchTerm", sidebarData.searchTerm);
    }
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    try {
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("startIndex", startIndex);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      if (data && data.posts) {
        setPosts([...posts, ...data.posts]);
        setShowMore(data.posts.length >= 9);
      } else {
        setShowMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:{" "}
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select
              onChange={handleChange}
              defaultValue={sidebarData.sort}
              id="sort"
            >
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <Select
              onChange={handleChange}
              defaultValue={sidebarData.category}
              id="category"
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="Technology">Technology</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Fashion">Fashion</option>
            </Select>
          </div>
          <Button type="submit" gradientDuoTone="purpleToPink" outline>
            Apply Filters
          </Button>
        </form>
      </div>
      <div className="w-full">
        {/* <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          All Posts
        </h1> */}
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5 ">
          Post Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && posts.length === 0 && (
            <p className="text-xl text-gray-500">No posts found.</p>
          )}
          {loading && <p className="text-xl text-gray-500">Loading...</p>}
          {!loading &&
            posts &&
            posts.map((post, index) => <PostCard post={post} key={index} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 hover:underline text-lg p-7 w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
