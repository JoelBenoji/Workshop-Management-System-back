const mongoose = require('mongoose')
const  {Schema, model} = mongoose


const UserSchema = new Schema({
    Name: String,
    Email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    Password: String,
    Make: String,
    Model: String
});

module.exports = mongoose.model('User', UserSchema)