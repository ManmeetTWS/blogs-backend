const express = require('express');
const { allBlogs, getBlogDetail, createBlog, updateBlog, deleteBlog, like } = require('../controllers/blogControllers.js');
const requireAuth = require('../middlewares/requireAuth.js')


const router = express.Router()

// router.use(requireAuth);

router.post('/blogs', allBlogs)

router.post('/createBlog', requireAuth ,createBlog)

router.post('/incomingLike', requireAuth,like)

// router.post('/addComment', requireAuth ,AddComment)

// router.post('/removeComment', requireAuth ,removeComment)

// router.post('/addReply', requireAuth, AddReply);

// router.post('/removeReply', requireAuth ,removeReply);

router.get('/blogs/:id', getBlogDetail)

router.patch('/updateBlog/:id', requireAuth ,updateBlog)

router.delete('/deleteBlog/:id', requireAuth ,deleteBlog)

module.exports = router;