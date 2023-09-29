const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    }
}, {timestamps: true})

userSchema.statics.signup = async function(email, username, password) {
    if(!email || !password || !username) {
        throw Error("All fields must be filled")
    }

    if(!validator.isEmail(email)){
        throw Error("Please Enter a valid Email")
    }

    const exists = await this.findOne({email});

    if(exists){
        throw Error("Email already in use!");
    }

    const usernamecheck = await this.findOne({username});

    if(usernamecheck){
        throw Error("Username is already taken!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({email, username, password:hash});

    return user
}

userSchema.statics.login = async function(email, password) {
    if(!email || !password) {
        throw Error("All fields must be filled")
    }

    if(!validator.isEmail(email)){
        throw Error("Please Enter a valid Email")
    }

    const user = await this.findOne({email});

    if(!user){
        throw Error("User does not exist.")
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        throw Error("Incorrect Password")
    }

    return user
}

const User = mongoose.model('User', userSchema);
module.exports = User