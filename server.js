const User = require("./model/user")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

var cors = require('cors')
var events = require('events')

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
app.post("/signup", (req, res) => {
    response = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        make: req.body.make,
        model: req.body.model
    };
    info = response
    const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
    var handler = function(){
    //Send to Database
    }
    const connect= async()=>{
    try{
        //Connect to Database
        mongoose.connect(url);
        var Users = new User({
            Name: info.name,
            Email: info.email,
            Password: info.password,
            Make: info.make,
            Model: info.model,
        })
        const result = await User.findOne({Email: info.email})

        if(!result){
            Users.save()
            res.json({"Status":"Success"})
        }
        else{
            res.json({"Status":"Failure"})
        }
    }catch(err){
        console.log(err);
    }  
}
    connect();
});

app.post("/",(req,res)=>{
    response = {
        Email : req.body.email,
        Password: req.body.password
    }
    const connect=async()=>{
        try{
            const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
            await mongoose.connect(url)
            const log =await User.findOne({Email: req.body.email})
            if(log.Password === req.body.password){
                console.log("Login Success")
                await res.json({"Success": "true",
                "Name": log.Name,
                "Make": log.Make,
                "Model": log.Model})
            }
            else{
                console.log("Failed")
            }
        }catch(err){
            console.log(err)
        }
    }
    connect();
})

app.listen(8080, console.log("Server Started at 8080"))
