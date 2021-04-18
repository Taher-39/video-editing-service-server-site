const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const port = process.env.PORT || 5000
require("dotenv").config()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('It Video Formation Server!')
})



const MongoClient = require('mongodb').MongoClient;
const { connect } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvvgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const servicesCollection = client.db("videoFormation").collection("services");
    const reviewsCollection = client.db("videoFormation").collection("reviews");
    const bookingCollection = client.db("videoFormation").collection("bookings");
    const adminCollection = client.db("videoFormation").collection("adminEmail");
    //review post
    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewsCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });
    //get review
    app.get('/getReview', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    //read by id
    app.get('/service/:id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document[0])
                console.log(document)
            })
    })
    //service upload
    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.serviceTitle;
        const price = req.body.servicePrice;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        servicesCollection.insertOne({ title, price, image: image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    //service read
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    //service delete
    app.delete('/delete/:id', (req, res) => {
        servicesCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then((result) => {
                res.send(result.deletedCount > 0)
            })
    })
    //booking post
    app.post('/bookingOrder', (req, res) => {
        const newBooking = req.body;
        bookingCollection.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    //booking post read by email
    app.get('/bookingList', (req, res) => {
        bookingCollection.find({ email: req.query.email })
            .toArray((err, document) => {
                res.send(document)
            })
    })
    //total orders get
    app.get('/totalOrders', (req, res) => {
        bookingCollection.find()
            .toArray((err, document) => {
                res.send(document)
            })
    })
    //booking get for update
    app.get('/updateBooking/:id', (req,res) =>{
        bookingCollection.find({_id: ObjectId(req.params.id)})
            .toArray((err, document) => {
                res.send(document[0])
            })
    })
    //booking patch for status
    app.patch('/updateStatus/:id', (req, res) => {
        bookingCollection.updateOne({ _id: ObjectId(req.params.id) },
        {
            $set: {status: req.body.status}
        })
            .then((result) => {
                res.send(result.modifiedCount > 0)
            })
    })

    //post admin email
    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });
    //isAdmin check
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({email: email})
            .toArray((err, admin) =>{
                res.send(admin.length > 0)
            })
    })
});



app.listen(port)