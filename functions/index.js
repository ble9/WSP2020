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
const session = require('express-session')
app.use(session({
    secret: 'anysecretstring.fdafdsafdsa',
    name: '__session',
    saveUninitialized: false,
    resave: false,
    secure: true, //https
    maxAge: 1000*60*60*2, //2 hours
    rolling: true, //resert magege 

}
))

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
const adminUtil = require('./adminUtil.js')

const Constants = require('./myconstants.js');

app.get('/', auth, async (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS);
    try {
        let products = [];
        const snapshot = await coll.orderBy("name").get();
        snapshot.forEach(doc => {
            products.push({ id: doc.id, data: doc.data()})
        })
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', { error: false, products, user: req.decodedIdToken, cartCount })
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', { error: e, user: req.decodedIdToken, cartCount })
    }
})


app.get('/b/about', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('about.ejs', { user: req.decodedIdToken, cartCount });
})

app.get('/b/contact', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('contact.ejs', { user: req.decodedIdToken, cartCount });

})

app.get('/b/signin', (req, res) => {
    res.setHeader('Cache-Control', 'private');
    res.render('signin.ejs', { error: false, user: req.decodedIdToken , cartCount:0 })
})

app.post('/b/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()

    try {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
        const userRecord = await auth.signInWithEmailAndPassword(email, password)
        const idToken = await userRecord.user.getIdToken()
        await auth.signOut()

        req.session.idToken = idToken

        if (userRecord.user.email === Constants.SYSADMINEMAIL) {
            res.setHeader('Cache-Control', 'private');
            res.redirect('/admin/sysadmin')
        } else{
        if (!req.session.cart){
            res.setHeader('Cache-Control', 'private');
            res.redirect('/')
        } else { 
            res.setHeader('Cache-Control', 'private');
                res.redirect('/b/shoppingcart')
            }
        }
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('signin', { error: e, user: null, cartCount:0 });
    }
});

app.get('/b/signout', async (req, res) => {

    req.session.destroy(err => {
        if (err) {
            req.session = null;
            res.send(`Error occurred while signing out: ${JSON.stringify(err)}`)
        } else {
            res.redirect('/')
        }
    });
});

app.get('/b/profile', authAndRedirectSignIn, (req, res) => {
        const cartCount = req.session.cart ? req.session.cart.length : 0
        res.setHeader('Cache-Control', 'private');
        res.render('profile', { user: req.decodedIdToken, cartCount, orders: false });
})

app.get('/b/signup', (req, res) => {
    res.render('signup.ejs', { page: 'signup', user: null, error: false, cartCount: 0 })
})

const ShoppingCart = require('./model/ShoppingCart.js')

app.post('/b/add2cart', async (req, res) => {
    const id = req.body.docId
    const quantityOption = req.body.quantityOption;
    const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try {
        const doc = await collection.doc(id).get()
        let cart;
        if (!req.session.cart) {
            //first time added to art
            cart = new ShoppingCart()
        } else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }

        const { name, price, summary, image, image_url } = doc.data()
      
        for(let i = 0; i < quantityOption; i++){
            cart.add({ id, name, price, summary, image, image_url })
        }
        req.session.cart = cart.serialize()
        res.setHeader('Cache-Control', 'private');
        res.redirect('/b/shoppingcart')
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.send(JSON.stringify(e))
    }
})

app.get('/b/shoppingcart', authAndRedirectSignIn, (req, res) => {
    let cart
    if (!req.session.cart) {
        cart = new ShoppingCart()
    } else {
        cart = ShoppingCart.deserialize(req.session.cart)
    }
    res.setHeader('Cache-Control', 'private');
    res.render('shoppingcart.ejs', { message :false, cart, user: req.decodedIdToken, cartCount: cart.contents.length })
})

app.post('/b/checkout', authAndRedirectSignIn, async (req,res )=>{
    if(!req.session.cart) {
        res.setHeader('Cache-Control', 'private');
        return res.send('Shopping car is Empty')
    }

    const data =  {
        uid: req.decodedIdToken.uid,
        // timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        cart:req.session.cart
    }
    try{ 
        await adminUtil.checkOut(data)
        req.session.cart = null;
        res.setHeader('Cache-Control', 'private');
        return res.render('shoppingcart.ejs', 
         {message: 'Checkout Successful', cart: new ShoppingCart(), user: req.decodedIdToken, cartCount:0})
}   catch (e){
    const cart = ShoppingCart.deserialize(req.session.cart )
    res.setHeader('Cache-Control', 'private');
    return res.render('shoppingcart.ejs',
      {message: 'Checkout Declined. Try again', cart, user: req.decodedIdToken, cartCount:cart.contents.length})
}
})


app.get('/b/orderhistory', authAndRedirectSignIn, async (req,res) =>{
    try {
       const orders = await adminUtil.getOrderHistory(req.decodedIdToken)
        res.setHeader('Cache-Control', 'private');
        res.render('profile.ejs', {user: req.decodedIdToken, cartCount: 0, orders})
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        // res.send('ERROR')
        res.send('<h1> Order History error <h1>')
    }   
})
// middle ware authentication function
async function authAndRedirectSignIn(req, res, next) { 
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            if (decodedIdToken.uid) {
            req.decodedIdToken = decodedIdToken
            return next()
        }} catch (e){
        console.log('-------------------------authAndRedirect error',e)
    }
    res.setHeader('Cache-Control', 'private');
    return res.redirect('/b/signin')
}

async function auth(req, res, next) {

    try{
        if (req.session && req.session.idToken) {
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            req.decodedIdToken = decodedIdToken
        }else{
            req.decodedIdToken = null
        }
    } catch (e){
        req.decodedIdToken = null
    }
    next()
}


app.post('/admin/signup', (req, res) => {
    return adminUtil.createUser(req, res)
})

app.get('/admin/sysadmin', authSysadmin, (req, res) => {
    res.render('./admin/sysadmin.ejs')
})

app.get('/admin/listUsers', authSysadmin, (req, res) => {
    return adminUtil.listUsers(req, res)
})

  async function authSysadmin(req, res, next) {
        try {
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken);
            if (!decodedIdToken || !decodedIdToken.email || decodedIdToken.email !== Constants.SYSADMINEMAIL) {
                return res.send('Access Denied1')
            }
            if (decodedIdToken.uid) {
                req.decodedIdToken = decodedIdToken
                return next()
            }
            return res.send('Access Denied0')
        } catch (e) {
            return res.send('Access Denied2')
        }
    }
