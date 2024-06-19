import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Table, Modal } from "flowbite-react";
import { Link } from "react-router-dom";
import {HiOutlineExclamationCircle} from 'react-icons/hi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postIDToDelete, setPostIDToDelete] = useState('');
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/post/getposts?userID=${currentUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.length > 9) {
            setShowMore(true);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(
        `/api/post/getposts?userID=${currentUser._id}&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try{
      const res = await fetch(`/api/post/deletepost/${postIDToDelete}/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = res.json();
      if(!res.ok){
        console.log(data.message);
      }
      else{
        setUserPosts((prev) => {
          return prev.filter((post) => post._id !== postIDToDelete);
        })
      }
    }
    catch(error){
      console.log(error.message);
    }
  }

  return (
    // scrollbar from tailwind scrollbar extension from npm
    <div className="table-auto w-full overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Upadated</Table.HeadCell>
              <Table.HeadCell>Post Image</Table.HeadCell>
              <Table.HeadCell>Post Title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userPosts.map((post) => (
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-20 h-10 object-cover bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span
                      className="text-red-500 text-md hover:underline cursor-pointer"
                      onClick={() => {
                        setShowModal(true);
                        setPostIDToDelete(post._id);
                      }}
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="text-teal-500"
                      to={`/update-post/${post._id}`}
                    >
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              className="w-full text-sm text-teal-500 self-center py-7 hover:underline"
              onClick={handleShowMore}
            >
              Show More
            </button>
          )}
        </>
      ) : (
        <p>You have not started posting yet</p>
      )}
      <Modal show={showModal} onClose={()=>setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you wanted to delete your post</h3>
            <div className="flex justify-center gap-4">
              <Button onClick={handleDeletePost} color='failure'>Yes, I'm sure</Button>
              <Button onClick={()=>setShowModal(false)} color='gray'>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>      
      </Modal>
    </div>
  );
}
