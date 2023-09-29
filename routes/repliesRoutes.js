const express = require('express');
const {addReply, getAllReplies, deleteReply} = require('../controllers/repliesControllers');
const requireAuth = require('../middlewares/requireAuth.js')

const router = express.Router();

router.post('/addReply', requireAuth ,addReply);

router.post('/getReplies', getAllReplies);

router.delete('/deleteReply', deleteReply);

module.exports = router;