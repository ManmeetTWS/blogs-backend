const express = require('express');
const { allBlogs, getBlogDetail, createBlog, updateBlog, deleteBlog, like, search, getBookmarks, addBookmark, removeBookmark } = require('../controllers/blogControllers.js');
const requireAuth = require('../middlewares/requireAuth.js')


const router = express.Router()

// router.use(requireAuth);

router.post('/blogs', allBlogs)

router.post('/createBlog', requireAuth ,createBlog)

router.post('/incomingLike', requireAuth,like)

router.get('/blogs/:id', getBlogDetail)

router.patch('/updateBlog/:id', requireAuth ,updateBlog)

router.get('/search-blogs/:query', search);

router.delete('/deleteBlog/:id', requireAuth ,deleteBlog)

router.get('/get-bookmarked-blogs', requireAuth, getBookmarks)

router.post('/add-bookmark', requireAuth , addBookmark);

router.post('/remove-bookmark', requireAuth, removeBookmark);

module.exports = router;