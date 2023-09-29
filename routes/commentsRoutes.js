const {addComment, getComments, deleteComment} = require('../controllers/commentsController');
const express = require('express');
const requireAuth = require('../middlewares/requireAuth.js')

const router = express.Router()

// router.use(requireAuth);

router.post('/addComment', requireAuth, addComment);

router.post('/getComments', getComments);

router.delete('/deleteComment', requireAuth, deleteComment);

module.exports = router