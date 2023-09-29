const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const replySchema = new Schema({
  comment_id:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:'Comments'
  },
  replyText:{
    type:String,
    required:true
  },
  from:{
    user_id:{
      type:Schema.Types.ObjectId,
      required:true
    },
    username:{
      type:String,
      required:true
    }
  }
}, {timestamps:true});


const Replies = mongoose.model('Replies', replySchema);
module.exports = Replies