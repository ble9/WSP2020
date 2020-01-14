const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', frontendHandler);

app.get('/b', backendHandler);

app.get('/home', frontendHandler);

app.get('/login', frontendHandler);

function frontendHandler(request, response) {
    response.sendFile(__dirname + '/spa/index.html')
}

function backendHandler(req, res) {
    const n = Math.random() // 0`1 not including one
    const num = Math.floor(n * 10)
    let s = 0;
    s = 50 + 12;
    let page = ``;
    res.send(page)
}





