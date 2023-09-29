const Replies = require('../models/replyModel');
const mongoose = require('mongoose');
const Comments = require('../models/commentsModel');

const addReply = async (req, res) => {
  const data = req.body;

  if (!mongoose.Types.ObjectId.isValid(data?.comment_id)) {
    return res.status(400).json({ error: 'Invalid Comment ID' });
  }

  if (!mongoose.Types.ObjectId.isValid(data?.user_id)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const obj = {
    comment_id: data.comment_id,
    replyText: data.replyText,
    from: {
      user_id: data.user_id,
      username: data.username,
    },
  };

  try {
    const reply = await Replies.create(obj);

    // Find the corresponding comment in the Comments model and update replyCount
    const comment = await Comments.findOne({ _id: data.comment_id });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Increment the replyCount by 1
    comment.replyCount += 1;

    // Save the updated comment
    await comment.save();

    res.status(200).json(reply);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  const { reply_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reply_id)) {
    return res.status(400).json({ error: 'Invalid comment_id' });
  }

  try {
    const deletedReply = await Replies.findByIdAndDelete(reply_id);

    if (!deletedReply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Find the associated comment
    const comment = await Comments.findOne({ _id: deletedReply.comment_id });

    if (!comment) {
      return res.status(404).json({ error: 'Associated comment not found' });
    }

    // Decrement the replyCount by 1
    comment.replyCount = comment.replyCount - 1;

    // Save the updated comment
    await comment.save();

    res.status(200).json({ deletedReply, status: 'deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};


const getAllReplies = async (req,res) => {
  const {comment_id} = req.body;

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    return res.status(400).json({ error: 'Invalid blog_id' });
  }

  try {
    const replies = await Replies.find({
      comment_id: comment_id,
    }).sort({ createdAt: -1 });

    if (!replies) {
      return res.status(404).json({ error: 'No replies found for the specified blog.' });
    }

    res.status(200).json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
}

module.exports = {
  addReply,
  getAllReplies,
  deleteReply
}