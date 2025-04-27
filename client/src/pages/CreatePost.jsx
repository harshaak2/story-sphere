import React, { useState, useEffect } from "react";
import { TextInput, Select, FileInput, Button, Alert } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { WandSparkles } from 'lucide-react';


import { app } from "../firebase.js";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [enhancing, setEnhancing] = useState(false);

  const navigate = useNavigate();

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error);
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleEnhancement = async () => {
    try {
      // Check if there's content to enhance
      if (!formData.content || formData.content.trim() === '') {
        setPublishError("Please write some content to enhance");
        return;
      }
      
      // Show loading state
      setEnhancing(true);
      setPublishError(null);
      
      // Call the API to enhance the content
      const res = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: formData.content }),
      });
      
      const data = await res.json();
      console.log("AI response data:", data); // Log the response to see its structure
      
      if (!res.ok) {
        setPublishError(data.message || data.error || "Error enhancing content");
        setEnhancing(false);
        return;
      }
      
      // Check for different possible response structures
      let enhancedContent;
      if (data.rephrasedContent) {
        enhancedContent = data.rephrasedContent;
      } else if (data.content) {
        enhancedContent = data.content;
      } else if (typeof data === 'string') {
        enhancedContent = data;
      } else {
        console.log("Unexpected data structure:", data);
        setPublishError("Received an unexpected response format from AI");
        setEnhancing(false);
        return;
      }
      
      // Update the content in the form data
      setFormData(prev => {
        const updated = { ...prev, content: enhancedContent };
        console.log("Updated formData:", updated);
        return updated;
      });
      
      // Show success message
      setPublishError(null);
      
      // Reset loading state
      setEnhancing(false);
    } catch (error) {
      console.error("Error enhancing content:", error);
      setPublishError("Failed to enhance content: " + error.message);
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      console.log(error);
      setPublishError("Something went wrong");
    }
  };

  // Add a custom style for the ReactQuill editor to handle dark mode text color
  const editorStyle = {
    color: "var(--text-color, #000)", // Default to black, fallback to CSS variable
  };

  // Apply the style dynamically based on dark mode
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode) {
    editorStyle.color = "#fff"; // Set text color to white in dark mode
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="font-semibold text-center my-7 text-3xl">Create a Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
          type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
            }}
          >
            <option value="Uncategorized">Select a Category</option>
            <option value="Technology">Technology</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Fashion">Fashion</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
          />
          <Button
            type="button"
            gradientDuoTone={"purpleToBlue"}
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && (
          <Alert color={"failure"}>{imageUploadError}</Alert>
        )}
        {formData.image && (
          <img
            src={formData.image}
            alt="preview"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write something"
          className="h-72 mb-12"
          style={editorStyle}
          value={formData.content || ''}
          onChange={(content) => {
            setFormData({ ...formData, content });
          }}
        />
        <Button
          type="button"
          outline
          className="flex items-center align-middle gap-2 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white"
          onClick={handleEnhancement}
          disabled={enhancing}
        >
          {enhancing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full mr-2"></div>
              <span className="font-medium">Enhancing...</span>
            </>
          ) : (
            <>
              <WandSparkles className="w-4 h-4" /> 
              <span className="font-medium">Enhance</span>
            </>
          )}
        </Button>
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
        {publishError && (
          <Alert color="failure" className="mt-5">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
