module.exports = (mongoose) => {
  const blogSchema = new mongoose.Schema({
    name: String,
    description: String,
    file: String,
    tags: [String],
    author: String,
    createDate: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
      default: Date.now,
    },
  });

  const Blog = mongoose.model("Blog", blogSchema);

  return Blog;
};
