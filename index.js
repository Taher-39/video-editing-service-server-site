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
    res.send('Hi...It Video Formation Server!')
})



const MongoClient = require('mongodb').MongoClient;
const { connect } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvvgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const servicesCollection = client.db("videoFormation").collection("services");
    const reviewsCollection = client.db("videoFormation").collection("reviews");
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
});



app.listen(port)