const User = require("./model/user")
const mongoose = require("mongoose")

const express = require("express")


const app = express()
const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'

const connect= async()=>{
    try{
        await mongoose.connect(url);
        const Users = new User({
            Name: 'Aswin P',
            Email: 'vijayanarjun@gmail.com',
            Make: 'Volvo',
            Model: 'XC90'
        })
        
        Users.save();
        
        const firstUser = await User.findOne({});
        console.log(firstUser)
    }catch(err){
        console.log(err);
    }  
}

connect();

