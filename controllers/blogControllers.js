const mongoose = require("mongoose");
const Blog = require("../models/blogModel");
const Comments = require('../models/commentsModel');

const allBlogs = async (req, res) => {
  const { start } = req.body;
  const limit = 6; 

  try {
    
    const totalBlogs = await Blog.countDocuments();

    const remainingBlogs = totalBlogs - start - limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit);

    if (!blogs) {
      return res.status(404).json({ error: "No blogs found" });
    }

    const modifiedBlogs = blogs.map((blog) => ({
      _id: blog._id,
      blogData: blog.blogData,
      blogLikes: blog.blogLikes,
      createdAt: blog.createdAt,
      author: blog.author,
    }));

    const response = {
      blogs: modifiedBlogs,
      next: remainingBlogs > 0 ? remainingBlogs : 0,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};


const getBlogDetail = async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid blog ID" });
  }

  try {
    const blog = await Blog.findOne({ _id });
    if (!blog) {
      return res.status(404).json({ error: "Blog does not exist." });
    }

    res.status(200).json( blog );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};



const createBlog = async (req, res) => {
  const blogData = {
    blogData:req.body.blogData,
    author:req.body.author
  };
  if (!blogData) {
    return res.status(400).json({ error: "Blog can't be Empty!" });
  }

  try {
    const blog = await Blog.create(blogData);

    if (!blog) {
      return res.status(400).json({ error: "Failed to create this Blog." });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};


const like = async ( req, res ) => { 
  const {blog_id,user_id, like_status} = req.body;

  try {
    const blog = await Blog.findById(blog_id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (like_status) {
      if (!blog.blogLikes.includes(user_id)) {
        
        blog.blogLikes.push(user_id);

        await blog.save();

        return res.status(200).json({ message: 'Liked the blog successfully' });
      } else {
        return res.status(400).json({ error: 'User already liked this blog' });
      }
    } else {
      if (blog.blogLikes.includes(user_id)) {
        blog.blogLikes = blog.blogLikes.filter((userId) => userId !== user_id);

        await blog.save();

        return res.status(200).json({ message: 'Unliked the blog successfully' });
      } else {
        return res.status(400).json({ error: 'User has not liked this blog' });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


const updateBlog = async (req, res) => {
  const blogId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ error: "Invalid blog ID" });
  }

  const { newBlogData } = req.body;

  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { $set: { blogData : newBlogData } },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};


const deleteBlog = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    // Delete the blog
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog does not exist in Database" });
    }

    // Delete all comments associated with the deleted blog
    const deleteCommentsResult = await Comments.deleteMany({ blog_id: id });

    console.log({
      deletedBlog,
      deletedComments: deleteCommentsResult.deletedCount,
      status: "deleted",
    })

    res.status(200).json({
      deletedBlog,
      deletedComments: deleteCommentsResult.deletedCount,
      status: "deleted",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  allBlogs,
  getBlogDetail,
  createBlog,
  like,
  // AddComment,
  // removeComment,
  // AddReply,
  // removeReply,
  updateBlog,
  deleteBlog
};
