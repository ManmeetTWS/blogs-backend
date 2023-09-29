const mongoose = require('mongoose');

const Schema = mongoose.Schema
const blogSchema = new Schema({
    blogData:{
        type:String,
        required:true
    },
    
    blogLikes:{
        type:[String]
    },

    blogComments:[
        {
          comment: {
            type: String,
            required: true,
          },
          by: {
            type: String,
            required: true,
          },
          commentReplies:[
            {
              reply: {
                type: String,
                required: true
              },
              replyBy:{
                type: String,
                required: true
              },
              createdAt:{
                type: Date,
                default:Date.now()
              }
            }
          ],
          createdAt: {
            type: Date,
            default: Date.now(), 
          }
        },
    ],

    author:{
        type:String,
        required:true
    }
}, { timestamps:true })

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog;