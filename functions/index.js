const functions = require('firebase-functions');
const express = require('express');
const app = express();
const path = require('path');

exports.httpReq = functions.https.onRequest(app);

app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, '/static')));
app.set('view engine', 'ejs');
app.set('views', './ejsviews')

// Front end programming
function frontendHandler(req, res) {
    res.sendFile(path.join(__dirname, '/prodadmin/prodadmin.html'));
}

app.get('/login', frontendHandler);
app.get('/home', frontendHandler);
app.get('/add', frontendHandler);
app.get('/show', frontendHandler);

// Backend programming
const firebase = require('firebase')

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyA-y2SCs2L2RRhKzZssDASqNJGpvo327IE",
    authDomain: "brianl-wsp20.firebaseapp.com",
    databaseURL: "https://brianl-wsp20.firebaseio.com",
    projectId: "brianl-wsp20",
    storageBucket: "brianl-wsp20.appspot.com",
    messagingSenderId: "926690846030",
    appId: "1:926690846030:web:28064a81febe7141212a1f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

const Constants = require('./myconstants.js');

app.get('/', auth, async(req, res) => {
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS);
    try {
        let products = [];
        const snapshot = await coll.orderBy("name").get();
        snapshot.forEach(doc => {
            products.push({ id: doc.id, data: doc.data() })
        });
        res.render('storefront.ejs', { error: false, products, user: req.user });
    } catch (e) {
        res.render('storefront.ejs', { error: e, user: req.user });
    }
});


app.get('/b/about', auth, async(req, res) => {
    res.render('about.ejs', { user: req.user });
});

app.get('/b/contact', auth, async(req, res) => {
    res.render('contact.ejs', { user: req.user });
});

app.get('/b/signIn', async(req, res) => {
    res.render('signin.ejs', { error: false, user: req.user });
});

app.post('/b/signIn', async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const auth = firebase.auth();

    try {
        const userRecord = await auth.signInWithEmailAndPassword(email, password);
        if(userRecord.user.email=== Constants.SYSADMINEMAIL){
                res.redirect('/admin/sysadmin')
        }else
        res.redirect('/');
    } catch (e) {
        res.render('signIn', { error: e, user: req.user });
    }
});

app.get('/b/signOut', async(req, res) => {
    try {
        await firebase.auth().signOut();
        res.redirect('/');
    } catch (e) {
        res.send('Error with signing out!');
    }
});

app.get('/b/profile', auth, (req, res) => {
    if (!req.user) {
        res.redirect('/b/signIn');
    } else {
        res.render('profile', { user: req.user });
    }
});

app.get('/b/signup', auth, async(req, res) => {
    res.render('signup.ejs', { page:'signup', user:null, error:false  });
});

// middle ware authentication function
function auth(req, res, next) {
    req.user = firebase.auth().currentUser;
    next();
}
const adminUtil = require ('./adminUtil.js')


app.post('/admin/signup',(req,res) =>{
    return adminUtil.createUser(req,res)

}) 

app.get('/admin/sysadmin',  authSysadmin, ( req,res) => {
    res.render('./admin/sysadmin.ejs')
})
app.get('/admin/listUsers', authSysadmin, (req,res ) =>{
    res.send('List Users')
})
function authSysadmin(req,res,next){
    const user = firebase.auth().currentUser
    if (!user || !user.email || user.email !== Constants.SYSADMINEMAIL)
    {
        res.send('<h1> System admin Page : access denied !</h1>')
    }else {
        next()
    }
 }
// test code

app.get('/testLogin', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/html/login.html'));
});

app.post('/testSignIn', (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    res.render('home', { email, pass, c: '<h1> Login Success </h1>', d: '<h1> Login Success Fake</h1>', start: 0, end: 10 });
});

app.get('/test', (req, res) => {
    const time = new Date().toString();
    let page = `
        <h1>Current time at server: ${time}</h1>
    `;
    res.send(page);
});

app.get('/test2', (req, res) => {
    res.redirect('http://www.google.com');
});