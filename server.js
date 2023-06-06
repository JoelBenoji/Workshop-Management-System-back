const express = require("express")
const mongoose = require("mongoose")

const app = express()
const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/?retryWrites=true&w=majority'

const connect = async()=>{
    try{
        await mongoose.connect(url);
        console.log("Connected to Mongoose")
    }catch(err){
        console.log(err);
    }
}

connect();

app.listen(4500,()=>{
    console.log("Success");
})