const express = require('express');
const { login, signup } = require('../controllers/authControllers')


const router = express.Router()

router.post('/login', login);
router.post('/signup', signup)

router.post('')


module.exports = router;