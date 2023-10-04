import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player'
import './style.css'; // Import your CSS file



function SocialMediaPost() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostVideo, setNewPostVideo] = useState(null);
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL, // Replace with your API URL
});
  useEffect(() => {
    // Fetch posts from the Express.js API when the component mounts
    axiosInstance.get('/api/posts')
      .then((response) => {
        console.log(response.data)
        setPosts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  const handlePostContentChange = (e) => {
    setNewPostContent(e.target.value);
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    setNewPostImage(file);
  };

  const handlePostVideoChange = (e) => {
    const file = e.target.files[0];
    setNewPostVideo(file);
  };

const handlePostSubmit = (e) => {
  e.preventDefault(); // Prevent the default form submission behavior

  // Create a new FormData object to send the data
  let formData = new FormData();
  console.log(e.target.image)
  formData.append('content', newPostContent);
  formData.append('image',newPostImage);
  console.log(formData,newPostImage)
  formData.append('video', newPostVideo);
  const headers = {
    'Content-Type': 'multipart/form-data',
   
    // Add other headers like authentication if needed
  };
  // Make a POST request to your Express.js API using axios
  axiosInstance.post('/api/posts', formData,{headers})
    .then((response) => {
      // Refresh the list of posts if needed
      axiosInstance.get('/api/posts')
        .then((response) => {
          setPosts(response.data);
        })
        .catch((error) => {
          console.error('Error fetching posts:', error);
        });

      // Clear input fields
      setNewPostContent('');
      setNewPostImage(null);
      setNewPostVideo(null);
    })
    .catch((error) => {
      console.error('Error creating a new post:', error);
    });
};

  const handleDeletePost = (postId) => {
    // Delete a post by making a DELETE request to the Express.js API
    axiosInstance.delete(`/api/posts/${postId}`)
      .then(() => {
        // Refresh the list of posts
        axiosInstance.get('/api/posts')
          .then((response) => {
            setPosts(response.data);
          })
          .catch((error) => {
            console.error('Error fetching posts:', error);
          });
      })
      .catch((error) => {
        console.error('Error deleting the post:', error);
      });
  };

 return (
    <div className="social-media-post">
      <h1>Social Media Post</h1>
      <form onSubmit={handlePostSubmit} className="post-form">
        <textarea
          className="post-content"
          placeholder="Enter your post content"
          value={newPostContent}
          onChange={handlePostContentChange}
        />
        <label>Chose Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePostImageChange}
          name="image"
          className="image"
          placeholder='Chose Image'
        />
         <label>Chose Video</label>
        <input
          type="file"
          accept="video/*"
          name="video"
          onChange={handlePostVideoChange}
          className="video"
            placeholder='Chose Video'

        />
        <button type="submit" className="post-button">
          Post
        </button>
      </form>
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <p>{post.content}</p>
            {post.imageUrl && (
              <img
                src={`${import.meta.env.VITE_REACT_APP_API_URL}${post.imageUrl}`}
                alt="Post"
                className="post-image"
              />
            )}
            {post.videoUrl && (
              <ReactPlayer
                url={`${import.meta.env.VITE_REACT_APP_API_URL}${post.videoUrl}`}
                playing={true}
                controls={true}
                className="post-video"
              />
            )}
            <button
              onClick={() => handleDeletePost(post.id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );

}

export default SocialMediaPost;
