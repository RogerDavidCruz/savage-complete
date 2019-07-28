const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://test:test@cluster0-ieizd.mongodb.net/savageDemo?retryWrites=true&w=majority";
const dbName = "savageDemo";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

//WEB API (all below)

//render the url and refresh
app.get('/', (req, res) => {
  //console.log(db)
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
    //how does messages connect here to ejs? [object - element with properties]
  })
})

//referring to the form /messages
app.post('/messages', (req, res) => {
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

//referring to the edit of the count and logic for each icon
//findOneAndUpdate is a mongodb method
//express function goes to the put endpoint of the local API through the /messaging route
//it request and responds a call that runs an annonymous function
//inside it declares a new variable to consider the new count
//undefined is added for the zero condition

app.put('/messages', (req, res) => {
  let newCount;
  if (req.body.thumbUp !== undefined){
    newCount = req.body.thumbUp + 1
  }else if (req.body.thumbDown !== undefined){
    newCount = req.body.thumbDown - 1
  }
  db.collection('messages').findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:newCount
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
