const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  blog_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Blog' // Reference to the Blog model
  },
  commentText: {
    type: String,
    required: true
  },
  from: {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' // Reference to the User model
    },
    username: {
      type: String,
      required: true
    }
  },
  replyCount: {
    type: Number,
    default: 0
  }
}, {timestamps:true});

const Comments = mongoose.model('Comments', commentSchema);
module.exports = Comments
