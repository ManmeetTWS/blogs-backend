const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const repliesRoute = require('./routes/repliesRoutes');
const cors = require('cors')


const app = express()
const PORT = process.env.PORT ||4000;


app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}));

app.get('/', (req,res) => {
    res.status(200).json({message:'Home Page'})
})

app.use('/auth', authRoutes)
app.use('/api', blogRoutes)
app.use('/api/comment', commentsRoutes)
app.use('/api/replies', repliesRoute)


mongoose.connect(process.env.MONGODB_URI)
 .then(() => {
    app.listen(PORT, () => {
        console.log('Server connected to DB and listening on PORT:',PORT);
    })
 })
 .catch((error) => {
    console.log(error)
 })
