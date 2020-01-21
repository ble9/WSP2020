const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', (req,res) => {
    res.send('<h1> My Store (from backend)<h1/>')
})


function frontendHandler(request, response) {
    response.sendFile(__dirname + '/prodadmin/prodadmin.html')
}

app.get('/show', frontendHandler);
app.get('/add', frontendHandler);
app.get('/home', frontendHandler);
app.get('/login', frontendHandler);
