const db = require("../models");
const Blog = db.blogs;
const upload = multer({ storage: storage });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
// Create a new blog
app.post("/blogs", upload.single("file"), async (req, res) => {
  const { name, description, tags } = req.body;
  const file = req.file ? req.file.filename : null;
  const author = req.user.username;

  const newBlog = new Blog({
    name,
    description,
    file,
    tags: tags.split(",").map((tag) => tag.trim()),
    author,
  });

  try {
    await newBlog.save();
    res.json(newBlog);
  } catch (error) {
    res.status(500).json({ error: "Error creating blog" });
  }
});

// Update a blog by ID
app.put("/blogs/:id", async (req, res) => {
  const blogId = req.params.id;
  const { name, description, tags } = req.body;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.name = name;
    blog.description = description;
    blog.tags = tags.split(",").map((tag) => tag.trim());
    blog.updateDate = Date.now();

    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Error updating blog" });
  }
});
