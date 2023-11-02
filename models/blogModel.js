const mongoose = require('mongoose');

const Schema = mongoose.Schema
const blogSchema = new Schema({
    blogTitle:{
      type:String,
      required:true
    },
    blogData:{
        type:String,
        required:true
    },
    
    blogLikes:{
        type:[String]
    },

    tags:{
      type:[String]
    },
    cover_image_url:{
      type:String ,
      required:true
    },
    author:{
        type:String,
        required:true
    }
}, { timestamps:true })

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog;




