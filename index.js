const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const port = 5000
const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('projectImage'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ma8l7.mongodb.net/creative-agency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// services collection
client.connect(err => {
  const serviceCollection = client.db("creative-agency").collection("services");

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    // const filePath = `${__dirname}/projectImage/${file.name}`
    // file.mv(filePath, err => {
      // if (err) {
      //   console.log(err);
      //   res.status(500).send({ msg: 'Failed to upload image' });
      // }
      const newImg = file.data;
      const encImg = newImg.toString('base64');
      const image = {
        contentType:file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      serviceCollection.insertOne({ title, description, image })
        .then(result => {
          // fs.remove(filePath, error => {
            // if (error) {
            //   console.log(error)
            //   res.status(500).send({ msg: 'Failed to upload image' });
            // }
            res.send(result.insertedCount > 0);
          // })
        })
    // })
  })
});

// clientFeedBack Collection

client.connect(err => {
  const feedbackCollection = client.db("creative-agency").collection("clientFeedback");

  app.post('/addFeedback', (req, res) => {
    const feedback = req.body;
    feedbackCollection.insertOne(feedback)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/clientFeedbacks', (req, res) => {
    feedbackCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
});

// placeOrder Collection

client.connect(err => {
  const orderCollection = client.db("creative-agency").collection("placeOrder");

  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.serviceName;
    const status = req.body.status;
    const projectDetails = req.body.projectDetails;
    // const filePath = `${__dirname}/projectImage/${file.name}`
    // file.mv(filePath, err => {
    //   if (err) {
    //     console.log(err);
    //     res.status(500).send({ msg: 'Failed to upload image' });
    //   }
      const newImg = file.data;
      const encImg = newImg.toString('base64');
      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      orderCollection.insertOne({ name, email, title, status, projectDetails, image })
        .then(result => {
          // fs.remove(filePath, error => {
          //   if (error) {
          //     console.log(error)
          //     res.status(500).send({ msg: 'Failed to upload image' });
          //   }
            res.send(result.insertedCount > 0);
          // })
        })
    // })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allOrder', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
});

// admin collection
client.connect(err => {
  const adminCollection = client.db("creative-agency").collection("admin");

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })
  })

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
});

app.listen(process.env.PORT || port)