const Comments = require('../models/commentsModel');
const mongoose = require('mongoose');
const Replies = require('../models/replyModel');


const getComments = async (req, res) => {
  const { blog_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(blog_id)) {
    return res.status(400).json({ error: 'Invalid blog_id' });
  }

  try {
    const comments = await Comments.find({ blog_id }).sort({ createdAt: -1 });

    if (!comments) {
      return res.status(404).json({ error: 'No comments found for the specified blog.' });
    }

    // Create an array to store promises for fetching replies
    const fetchRepliesPromises = comments.map(async (comment) => {
      const replies = await Replies.find({ comment_id: comment._id });
      // Create a new object with replies added to the comment
      return { ...comment.toObject(), replies };
    });

    // Use Promise.all to fetch replies for all comments in parallel
    const commentsWithReplies = await Promise.all(fetchRepliesPromises);

    res.status(200).json(commentsWithReplies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};


const deleteComment = async (req, res) => {
  const { comment_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    return res.status(400).json({ error: 'Invalid comment_id' });
  }

  try {
    // Find and delete the comment by comment_id
    const deletedComment = await Comments.findByIdAndDelete(comment_id);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Find and delete all replies associated with the deleted comment
    await Replies.deleteMany({ comment_id: comment_id });

    res.status(200).json({ deletedComment, status: 'deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};


const addComment = async (req, res) => {
  const data = req.body;

  // Validate the blogId and userId
  if (!mongoose.Types.ObjectId.isValid(data?.forBlog)) {
    return res.status(400).json({ error: 'Invalid blogId' });
  }

  if (!mongoose.Types.ObjectId.isValid(data?.userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const requestData = {
      blog_id: data?.forBlog,
      commentText: data?.commentText,
      from: {
        user_id: data?.userId,
        username: data?.username,
      },
      replyCount:0
    };

    const comment = await Comments.create(requestData);
    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment
}