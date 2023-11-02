const mongoose = require("mongoose");
const Blog = require("../models/blogModel");
const User = require('../models/userModel');
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
      blogTitle: blog.blogTitle,
      blogData: blog.blogData,
      blogLikes: blog.blogLikes,
      createdAt: blog.createdAt,
      cover_image_url: blog.cover_image_url,
      tags:blog.tags,
      author: blog.author,
    }));

    const response = {
      blogs: modifiedBlogs,
      total:totalBlogs,
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
    blogTitle:req.body.blogTitle,
    blogData:req.body.blogData,
    author:req.body.author,
    tags:req.body.tags,
    cover_image_url:req.body.cover_image_url
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

  const { newBlogTitle,newBlogData, newTags, newCoverImageUrl } = req.body;

  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { $set: { blogTitle:newBlogTitle, blogData : newBlogData, tags:newTags, cover_image_url: newCoverImageUrl } },
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


const search = async (req, res) => {
  try {
    const searchQuery = req.params.query;

    // Escape special characters in the searchQuery
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const blogs = await Blog.find({
      $or: [
        { blogTitle: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(escapedQuery, 'i')] } },
      ],
    });

    const blogsWithTitle = blogs.filter((blog) =>
      blog.blogTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const blogsWithTags = blogs.filter((blog) =>
      blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const searchResults = {
      with_title: blogsWithTitle,
      with_tag: blogsWithTags,
    };
    return res.status(200).json(searchResults);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find the user by ID
    const user = await User.findById(userId);

    // 2. Handle the case when the user is not found
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Get the bookmarked blog IDs from the user
    const bookmarkedBlogIds = user.bookmarks;

    // 4. If there are no bookmarked blog IDs, return an empty array
    if (!bookmarkedBlogIds || bookmarkedBlogIds.length === 0) {
      return res.status(200).json({ bookmarks: [] });
    }

    // 5. Find the bookmarked blogs using the Blog model
    const bookmarkedBlogs = await Blog.find({ _id: { $in: bookmarkedBlogIds } });

    // 6. Handle errors gracefully
    if (!bookmarkedBlogs || bookmarkedBlogs.length === 0) {
      return res.status(200).json({ error: 'No bookmarked blogs found' });
    }

    // 7. Return the bookmarked blogs as a response
    res.status(200).json({ bookmarks: bookmarkedBlogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const addBookmark = async (req, res) => {
  const { blog_id } = req.body;
  const user_id = req.user._id;

  try {
    // Step 1: Find the user
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 2: Check if the blog_id is not already in bookmarks
    if (!user.bookmarks.includes(blog_id)) {
      // Step 3: Push the blog_id into the bookmarks array
      user.bookmarks.push(blog_id);

      // Step 4: Save the updated user document
      await user.save();
    

      return res.status(200).json({ message: 'Blog added to bookmarks' });
    } else {
      return res.status(200).json({ message: 'Blog is already in bookmarks' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeBookmark = async (req, res) => {
  const { blog_id } = req.body;
  const user_id = req.user._id;
  // console.log("RemoveBookmark - ", blog_id)

  try {
    // Step 1: Find the user
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 2: Check if the blog_id is in bookmarks
    if (user.bookmarks.includes(blog_id)) {
      // Step 3: Remove the blog_id from the bookmarks array
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== blog_id.toString());

      // Step 4: Save the updated user document
      await user.save();
  
      return res.status(200).json({ message: 'Blog removed from bookmarks' });
    } else {
      return res.status(200).json({ message: 'Blog was not in bookmarks' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  allBlogs,
  getBlogDetail,
  createBlog,
  like,
  search,
  updateBlog,
  deleteBlog,
  getBookmarks,
  addBookmark,
  removeBookmark
};
