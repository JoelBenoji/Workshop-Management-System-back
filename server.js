const User = require("./model/user")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
var cors = require('cors')
var events = require('events')
var eventEmitter = new events.EventEmitter();

const express = require("express")
const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded(
    {
        extended:true
    }
));

var info = {};

//Post Request Handling
app.post("/", (req, res) => {
    response = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        make: req.body.make,
        model: req.body.model
    };
    info = response
    console.log(response)
    res.send("Registered")
    eventEmitter.emit('send')
});

const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
var handler = function(){
    //Send to Database
    const Users = new User({
        Name: info.name,
        Email: info.email,
        Password: info.password,
        Make: info.make,
        Model: info.model,
    })
    Users.save();
}
const connect= async()=>{
    try{
        //Connect to Database
        mongoose.connect(url);
        eventEmitter.on('send',handler);    
    }catch(err){
        console.log(err);
    }  
}
connect();

app.listen(8080, console.log("Server Started at 8080"))
