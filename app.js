
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path"); // Required for file path manipulation
const fs = require("fs"); // Required for file operations

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "social-media",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});


app.use("/uploads", express.static("uploads"));

app.post(
  "/api/posts",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  (req, res) => {
    const content = req.body.content;
    const imageFile = req.files["image"][0];
    const videoFile = req.files["video"][0];

    // Define URLs for the image and video
    const imagePath = `/uploads/${imageFile.filename}`;
    const videoPath = `/uploads/${videoFile.filename}`;

    
      const sql =
        "INSERT INTO posts (content, imageUrl, videoUrl) VALUES (?, ?, ?)";
      db.query(sql, [content, imagePath, videoPath], (err, result) => {
        if (err) {
          console.error("Error creating a new post:", err);
          res.status(500).json({ error: "Error creating a new post" });
          return;
        }
        res.status(201).json({ message: "Post created successfully" });
      });
  }
);



// Example: Retrieve all posts
app.get("/api/posts", (req, res) => {
  const sql = "SELECT * FROM posts";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving posts:", err);
      res.status(500).json({ error: "Error retrieving posts" });
      return;
    }
    res.status(200).json(results);
  });
});

app.delete("/api/posts/:postId", (req, res) => {
  const postId = req.params.postId;

  // Check if the post with the specified ID exists
  const checkExistenceSql = "SELECT * FROM posts WHERE id = ?";
  db.query(checkExistenceSql, [postId], (err, results) => {
    if (err) {
      console.error("Error checking post existence:", err);
      res.status(500).json({ error: "Error checking post existence" });
      return;
    }

    if (results.length === 0) {
      // If the post doesn't exist, return a 404 Not Found response
      res.status(404).json({ error: "Post not found" });
    } else {
      // If the post exists, delete it
      const deleteSql = "DELETE FROM posts WHERE id = ?";
      db.query(deleteSql, [postId], (err) => {
        if (err) {
          console.error("Error deleting the post:", err);
          res.status(500).json({ error: "Error deleting the post" });
          return;
        }
        res.status(200).json({ message: "Post deleted successfully" });
      });
    }
  });
});

// ... Define other CRUD routes (update and delete) as needed

// Start the Express server
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client", "dist", "index.html"));
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
