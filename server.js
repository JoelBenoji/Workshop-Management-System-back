const User = require("./model/user")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
var ObjectID = require('mongodb').ObjectID;

var bcrypt = require('bcrypt')

const { MongoClient } = require('mongodb')

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
        extended: true
    }
));

var info = {};
//Emergency Services
app.post('/emergency/', async (req, res) => {
    response = {
        Name: req.body.Name,
        Phone: req.body.Phone,
        Description: req.body.Description,
        Latitude: req.body.Latitude,
        Longitude: req.body.Longitude
    }
    try {
        var data
        console.log(response)
        await client.connect();
        const check = await client.db('Workshop').collection("Emergency").findOne()

        if (check === null) {
            data = await client.db("Workshop").collection("Emergency").insertOne({
                Name: response.Name,
                Phone: response.Phone,
                Description: response.Description,
                Latitude: response.Latitude,
                Longitude: response.Longitude,
                Status: 'Active'
            })
        }
        else {
            data = {
                Status: 'Failed'
            }
        }
        res.send(data)
    } catch (e) {
        console.log(e)
    }
})
//Emergency Get
app.get('/emergencydata/', async (req, res) => {
    await client.connect()
    const data = await client.db("Workshop").collection("Emergency").find();
    res.send(data)
})


//Admin Login
app.post('/adminlogin', async (req, res) => {
    response = {
        Password: req.body.Password
    }
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Admin").findOne();
        var checkPass = await bcrypt.compare(response.Password, data.Password)
        if (checkPass === true) {
            console.log('Admin Login Success')
            res.json({
                "Success": "true",
                Name: data.Name
            })
        }
        else {
            res.json({
                "Success": "Invalid Credentials"
            })
            console.log('Admin Login Failed')
        }
    } catch (e) {
        console.log(e)
    }
})

//Employee List Data
app.get('/admin/emplist', async (req, res) => {
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Employee").find().toArray();

        const appointmentonwork = await client.db("Workshop").collection("Appointments").find({
            Status: 'On Work'
        }).toArray();
        const appointmentaccepted = await client.db("Workshop").collection("Appointments").find({
            Status: 'Accepted'
        }).toArray();

        const appointment = [...appointmentonwork, ...appointmentaccepted]

        for (var i = 0; i < appointment.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (appointment[i].Empid === data[j].Empid) {
                    data[j] = {
                        Empid: data[j].Empid,
                        Name: data[j].Name,
                        Category: data[j].Category,
                        CustomerName: appointment[i].Name,
                        CustomerEmail: appointment[i].Email,
                        Status: appointment[i].Status,
                        Description: appointment[i].Description
                    }
                }
            }
        }
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
//Emergency List in Admin Page
app.get('/admin/emergency', async (req, res) => {
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Emergency").findOne()

        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
//Emergency Mark Finish
app.post('/admin/emer/markfinish', async (req, res) => {
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Emergency").deleteOne()
    } catch (e) {
        console.log(e)
    }
})
// User List in Admin Page
app.get('/admin/userlist', async (req, res) => {
    await client.connect();
    const data = await client.db("Workshop").collection("users").find().toArray();
    await res.json(data)
})

//Get Request Handling(Signup)
app.get("/signup/make", async (req, res) => {
    var cars = []
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Cars").find({}, { Make: 1 }).toArray();
        for (var i = 0; i < data.length; i++) {
            if (cars.includes(data[i].Make)) {
                continue;
            }
            else {
                await cars.push(data[i].Make)
                cars.sort();
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
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
    var check = new RegExp(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/)
    let isValid = check.test(response.email)
    const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
    const connect = async () => {
        try {
            //Connect to Database
            mongoose.connect(url);
            if (isValid) {
                var Users = new User({
                    Name: info.name,
                    Email: info.email,
                    Password: await bcrypt.hash(info.password, 10),
                    Make: info.make,
                    Model: info.model,
                })
                const result = await User.findOne({ Email: info.email })
                if (!result) {
                    Users.save()
                    res.json({ "Status": "Success" })
                }
                else {
                    res.json({ "Status": "User already exists" })
                }
            }
            else {
                res.json({ "Status": "Invalid email id" })
            }
        } catch (err) {
            console.log(err);
        }
    }
    connect();
});

app.post("/signup/model", async (req, res) => {
    var models = []
    response = {
        Make: req.body.Make
    }
    try {
        await client.connect();
        const data = await client.db("Workshop").collection("Cars").find({ Make: response.Make }).toArray();
        for (var i = 0; i < data.length; i++) {
            if (models.includes(data[i].Model)) {
                continue;
            }
            else {
                await models.push(data[i].Model)
                models.sort();
            }
        }
        if (models !== []) {
            res.json({
                Models: models
            })
        }
    } catch (e) {
        console.log(e);
    }
})


//Appointment List function User
app.post('/user/dashboard', async (req, res) => {
    var appointments = []
    response = {
        Email: req.body.email
    }
    try {
        await client.connect()
        var data = await client.db("Workshop").collection("Appointments").find({
            Email: response.Email
        }).toArray()
    }
    catch (e) {
        console.log(e)
    }
    appointments = data
    res.json(appointments)
})

//Post Request Handling(Login User)
app.post("/", (req, res) => {
    response = {
        Email: req.body.email,
        Password: req.body.password
    }
    const checksend = async (log) => {
        if (await bcrypt.compare(req.body.password,log.Password)) {
            console.log("User Login Success")
            res.json({
                "Success": "true",
                "Name": log.Name,
                "Make": log.Make,
                "Model": log.Model,
                "Email": response.Email,
            })
        }
        else {
            console.log("Failed")
            res.json({
                'Success': "Invalid Credentials"
            })
        }
    }
    const connect = async () => {
        try {
            const url = 'mongodb+srv://arjun:arjun@workshop.1les3e8.mongodb.net/Workshop?retryWrites=true&w=majority'
            await mongoose.connect(url)
            const log = await User.findOne({ Email: req.body.email })
            await checksend(log);
        } catch (err) {
            console.log(err)
            await res.json({ "Success": "false" })
        }
    }
    connect();
})

//New Appointment
app.post("/user/dashboard/newappoint", async (req, res) => {
    response = {
        Name: req.body.name,
        Email: req.body.email,
        Category: req.body.category,
        Date: req.body.date,
        Description: req.body.desc,
        Make: req.body.make,
        Model: req.body.model,
    }
    const connect = async () => {
        try {
            var flag = true
            await client.connect();
            const check = await client.db('Workshop').collection('Appointments').find({
                Email: response.Email
            }).toArray()
            console.log(check)
            if (check === []) {
                flag = true
            }
            else {
                for (i = 0; i < check.length; i++) {
                    if (check[i].Status === 'Paid') {
                        flag = true
                    }
                    else {
                        flag = false
                        break;
                    }
                }
            }
            if (flag === true) {
                const data = await client.db("Workshop").collection("Appointments").insertOne({
                    Name: response.Name,
                    Email: response.Email,
                    Date: response.Date,
                    Make: response.Make,
                    Model: response.Model,
                    Category: response.Category,
                    Description: response.Description,
                    Status: 'Pending',
                    Empid: null,
                })
                await res.json({
                    "Status": "Inserted Successfully"
                })
            }
            else {
                await res.json({
                    "Status": "Pending Appointments to be completed"
                })
            }
        } catch (err) {
            console.log(err)
            await res.json({ "Status": "Some error occured" })
        }
    }
    connect();
})

//Payment for Appointment 
app.post('/user/dashboard/payment', async (req, res) => {
    response = {
        Status: req.body.Status,
        id: req.body.id
    }
    await client.connect()
    const data = await client.db('Workshop').collection('Appointments').updateOne({
        _id: new mongoose.Types.ObjectId(response.id)
    }, {
        $set: {
            Status: 'Paid',
        }
    })
})

// Post Request Handling (Employee Login)
app.post("/emplogin", (req, res) => {
    response = {
        Empid: req.body.Empid,
        Password: req.body.Password
    }
    const main = async () => {
        try {
            await client.connect();
            const data = await client.db("Workshop").collection("Employee").findOne({ Empid: response.Empid });
            if (data.Password == response.Password) {
                await res.json({
                    "Success": "true",
                    "Name": data.Name,
                    "Phone": data.Phone,
                    "Category": data.Category,
                })
                console.log("Employee Login Success")
            }
            else {
                await res.json({
                    "Success": "Invalid Credentials"
                })
            }
        } catch (e) {
            console.log(e);
        }
    }
    main();
})

//Appointment View Employee
app.get('/emp/dashboard/Electrical', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Pending",
            Category: 'Electrical'
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
app.get('/emp/dashboard/General', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Pending",
            Category: 'General'
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
app.get('/emp/dashboard/Body Work', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Pending",
            Category: 'Body Work'
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
app.get('/emp/dashboard/Air Conditioning', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Pending",
            Category: 'Air Conditioning'
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
app.get('/emp/dashboard/Engine Specialist', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Pending",
            Category: 'Engine Specialist'
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})
app.post('/emp/dashboard/joblist', async (req, res) => {
    try {
        await client.connect()
        const data = await client.db("Workshop").collection("Appointments").find({
            Status: "Accepted",
            Empid: req.body.Empid
        }).toArray()
        await res.json(data)
    } catch (e) {
        console.log(e)
    }
})

//Job Select System
app.post('/emp/dashboard', async (req, res) => {

    response = {
        id: req.body.id,
        Status: req.body.Status,
        Empid: req.body.Empid,
    }
    try {
        await client.connect()
        const data = await client.db('Workshop').collection('Appointments').updateOne({
            _id: new mongoose.Types.ObjectId(response.id)
        }, {
            $set: {
                Status: 'Accepted',
                Empid: response.Empid
            }
        }
        )
        console.log(data)
    } catch (e) {
        console.log(e)
    }
})

//Job Workflow
app.post('/emp/dashboard/joblistcurr', async (req, res) => {
    response = {
        Empid: req.body.Empid
    }
    try {
        await client.connect()
        const check = await client.db('Workshop').collection('Appointments').findOne({
            Empid: response.Empid,
            Status: 'On Work'
        })
        await res.json(check)
    } catch (e) {
        console.log(e)
    }
})

app.post('/emp/dashboard/jobselect', async (req, res) => {
    response = {
        Empid: req.body.Empid,
        id: req.body.id
    }
    try {
        await client.connect()
        const check = await client.db('Workshop').collection('Appointments').find({
            Empid: response.Empid,
        }).toArray()
        var flag = false
        for (i = 0; i < check.length; i++) {
            if (check[i].Status === 'On Work') {
                flag = true
                break
            }
            else {
                flag = false
            }
        }
        if (flag === true) {
            await res.json({
                Message: 'Complete a job before taking in another'
            })
        }
        else {
            const data = await client.db('Workshop').collection('Appointments').updateOne({
                _id: new mongoose.Types.ObjectId(response.id)
            }, {
                $set: {
                    Status: 'On Work',
                }
            })
            await res.json({
                Name: data.Name,
                Date: data.Date,
                Make: data.Make,
                Model: data.Model,
                Cost: data.Cost,
                Message: 'Added Successfully'
            })
        }
    } catch (e) {
        console.log(e)
    }

})

app.post('/emp/markfinish', async (req, res) => {
    response = {
        Cost: parseInt(req.body.Cost),
        id: req.body.id
    }
    await client.connect()
    try {
        const check = await client.db('Workshop').collection('Appointments').updateOne({
            _id: new mongoose.Types.ObjectId(response.id)
        }
            , {
                $set: {
                    'Status': 'Finished',
                    'Cost': response.Cost,
                    'Amount': (response.Cost + (25 * (response.Cost) / 100))
                }
            }
        )
        await res.json({
            'Message': 'Job Marked as Finished'
        })
    }
    catch (e) {
        console.log(e)
    }
})

app.listen(8080, console.log("Server Started at 8080"))
