const User = require("./model/user")
const mongoose = require("mongoose")

const express = require("express")
const app = express()

app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
  });

const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
const connect= async()=>{
    try{
        await mongoose.connect(url);
        const firstUser = await User.findOne({});
        console.log(firstUser)
    }catch(err){
        console.log(err);
    }  
}
connect();
app.listen(8080, console.log("Server Started at 8080"))
