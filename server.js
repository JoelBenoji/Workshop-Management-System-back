const User = require("./model/user")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
var ObjectID = require('mongodb').ObjectID;

const {MongoClient} = require('mongodb')

var cors = require('cors')
var events = require('events')

var uri = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
const client = new MongoClient(uri)

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
//Get Request Handling(Signup)
app.get("/signup/make",async(req, res)=>{
    var cars = []
    try{
        await client.connect();
        const data = await client.db("Workshop").collection("Cars").find({},{Make:1}).toArray();
        for(var i=0;i < data.length;i++){
            if(cars.includes(data[i].Make)){
                continue;
            }
            else{
                await cars.push(data[i].Make)
                cars.sort();
            }
        }
    }catch(e){
        console.log(e); 
    }finally{
        await client.close();
    }
    res.json({
        Makes: cars
    })
})


//Post Request Handling(Signup)
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

app.post("/signup/model",async(req, res)=>{
    var models= []
    response = {
        Make: req.body.Make
    }
    try{
        await client.connect();
        const data = await client.db("Workshop").collection("Cars").find({Make: response.Make }).toArray();
        for(var i=0;i < data.length;i++){
            if(models.includes(data[i].Model)){
                continue;
            }
            else{
                await models.push(data[i].Model)
                models.sort();
            }
        }
        if(models !== []){
            res.json({
                Models: models
            })
        }
    }catch(e){
        console.log(e); 
    }
})

//Post Request Handling(Login User)
app.post("/",async(req,res)=>{
    response = {
        Email : req.body.email,
        Password: req.body.password
    }
    const checksend=async(log)=>{
        if(log.Password === req.body.password){
                console.log("User Login Success")
                await res.json({"Success": "true",
                "Name": log.Name,
                "Make": log.Make,
                "Model": log.Model,
                "Email": response.email,
            })
                applist(response.email)
            }
        else{
                console.log("Failed")
            }
    }
    const connect=async()=>{
        try{
            const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
            await mongoose.connect(url)
            const log =await User.findOne({Email: req.body.email})
            await checksend(log);
        }catch(err){
            console.log(err)
            await res.json({"Success":"false"})
        }
    }
    connect();
})



//Appointment List function User
const applist=(email)=>{
    app.get('/user/dashboard',async(req,res)=>{
        var appointments = []
        const listget=async()=>{
            try{
                await client.connect()
                const data = await client.db("Workshop").collection("Appointments").find({
                    Email : email
                }).toArray()
                console.log(data)
                appointments = data
                await res.json(appointments)
            }
            catch(e){
                console.log(e)
            }
        }
        listget()
    })
}


//New Appointment
app.post("/user/dashboard",async(req,res)=>{
    response = {
        Name: req.body.name,
        Email: req.body.email,
        Category : req.body.category,
        Date: req.body.date,
        Description: req.body.desc,
        Make: req.body.make,
        Model:req.body.model,
    }
    console.log(response)
    const connect=async()=>{
        try{
            await client.connect();
            const data = await client.db("Workshop").collection("Appointments").insertOne({
                Name: response.Name,
                Email: response.Email,
                Date: response.Date,
                Make: response.Make,
                Model: response.Model,
                Category : response.Category,
                Description: response.Description,
                Status: 'pending',
                Empid: null,
            })
        }catch(err){
            console.log(err)
            await res.json({"Success":"false"})
        }
    }
    connect();
    applist(response.email)
})

// Post Request Handling (Employee Login)
app.post("/emplogin",(req,res)=>{
    response = {
        Empid : req.body.Empid,
        Password : req.body.Password
    }
    const main =async()=>{
        try{
            await client.connect();
            const data = await client.db("Workshop").collection("Employee").findOne({Empid : response.Empid});
            if(data.Password == response.Password){
                await res.json({"Success": "true",
                "Name": data.Name,
                "Phone": data.Phone,
                "Category": data.Category,
                })
                await applist(data.Category)
                console.log("Employee Login Success")
            }
        }catch(e){
            console.log(e); 
        }
    }
    main();
})

//Appointment View Employee
app.get('/emp/dashboard/Electrical',async(req,res)=>{
    try{
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "pending",
            Category: 'Electrical'
        }).toArray()
        await res.json(data)
        console.log(data)
    }catch(e){
        console.log(e)
    }
})
app.get('/emp/dashboard/General',async(req,res)=>{
    try{
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "pending",
            Category: 'General'
        }).toArray()
        await res.json(data)
        console.log(data)
    }catch(e){
        console.log(e)
    }
})
app.post('/emp/dashboard',async(req,res)=>{
    
    response = {
        id: req.body.id,
        Status: req.body.Status,
        Empid: req.body.Empid,
    }
    console.log(response)
    try{
        await client.connect()
        const data = await client.db('Workshop').collection('Appointments').updateOne({
            _id: new mongoose.Types.ObjectId(response.id)
        },{
            $set:{
                Status: 'Accepted',
                Empid: response.Empid
            }
        }
        )
        console.log(data)
    }catch(e){
        console.log(e)
    }
})

app.listen(8080, console.log("Server Started at 8080"))
