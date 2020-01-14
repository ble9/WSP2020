const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', requestHandler);

app.get('/home', requestHandler);

app.get('/login', requestHandler);

function requestHandler(request, response) {
    response.sendFile( __dirname + 'functions\Lol\index.html')
}




