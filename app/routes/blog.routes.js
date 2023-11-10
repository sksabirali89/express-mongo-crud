const multer = require("multer");
const path = require("path");
const db = require("../models");
const Blog = db.blogs;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
  // Get all blogs
  app.get("/api/blogs", async (req, res) => {
    // #swagger.tags = ['Blog']
    try {
      const { pageNumber = 1, pageSize = 5 } = req.query;
      const skip = (pageNumber - 1) * pageSize;
      const limit = parseInt(pageSize, 10);
      const blogs = await Blog.find()
        .skip(skip)
        .limit(limit)
        .sort({ updateDate: -1 }); // Sorting in descending order (latest first);

      const totalCount = await Blog.countDocuments();
      const totalPages = Math.ceil(totalCount / pageSize);

      res.json({
        pageNumber: parseInt(pageNumber),
        pageSize: limit,
        totalCount,
        totalPages,
        data: blogs,
      });

      //res.json(blogs);
    } catch (error) {
      res.status(500).json({ error: "Error fetching blogs" });
    }
  });
  // Get a specific blog by ID
  app.get("/api/blogs/:id", async (req, res) => {
    // #swagger.tags = ['Blog']
    const blogId = req.params.id;
    try {
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Error fetching blog" });
    }
  });
  // Create a new blog
  app.post("/api/blogs", upload.single("file"), async (req, res) => {
    // #swagger.tags = ['Blog']

    try {
      console.log(req.body);
      const { name, description, tags, author } = req.body;
      const file = req.file ? req.file.filename : null;

      console.log("req.tags", req.body.tags);

      const newBlog = new Blog({
        name,
        description,
        file,
        tags: tags,
        author,
      });
      await newBlog.save();
      res.json(newBlog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a blog by ID
  app.put("/api/blogs/:id", upload.single("file"), async (req, res) => {
    // #swagger.tags = ['Blog']
    const blogId = req.params.id;
    console.log("blogId", blogId);
    console.log("req.body", req.body);
    console.log("req.query", req.query);
    console.log("req.params", req.params);
    //return res.json(req.body);
    const { name, description, tags, author } = req.body;

    try {
      const blog = await Blog.findById(blogId);
      console.log("blog1", blog);
      if (!blog) return res.status(404).json({ error: "Blog not found" });

      // blog.name = name;
      // blog.description = description;
      // blog.tags = tags;
      // blog.updateDate = Date.now();
      // console.log("blog2", blog);

      // await blog.save();

      // const updatedUser = await Blog.updateOne(
      //   { _id: blogId },
      //   { name: name, updateDate: Date.now() }
      // );
      const updatedUser = await Blog.where({ _id: blogId }).updateOne({
        $set: {
          name,
          description,
          tags,
          author,
          updateDate: Date.now(),
        },
      });
      //console.log("blog2", blog);
      res.json(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error updating blog" });
    }
  });
  // Delete a blog by ID
  app.delete("/api/blogs/:id", async (req, res) => {
    // #swagger.tags = ['Blog']
    const blogId = req.params.id;

    try {
      const deletedBlog = await Blog.findByIdAndDelete(blogId);
      if (!deletedBlog)
        return res.status(404).json({ error: "Blog not found" });
      res.json(deletedBlog);
    } catch (error) {
      res.status(500).json({ error: "Error deleting blog" });
    }
  });
};
