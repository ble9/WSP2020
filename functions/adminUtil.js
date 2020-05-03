var admin = require("firebase-admin");

var serviceAccount = require("./brianl-wsp20-firebase-adminsdk-29ok8-3d4c9c7293.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://brianl-wsp20.firebaseio.com"
});

const Constants = require('./myconstants.js');

async function createUser(req, res) {
    const email = req.body.email
    const password = req.body.password
    const displayName = req.body.displayName
    const phoneNumber = req.body.phoneNumber
    const photoURL = req.body.photoURL
    try {
        await admin.auth().createUser({ email, password, displayName, phoneNumber, photoURL })
        res.render('signin.ejs', { page: 'signin', user: false, error: 'Account created! ', cartCount: 0 })
    } catch (e) {
        res.render('signup.ejs', { error: e, user: false, page: 'signup', cartCount: 0 })
    }
}
async function listUsers(req, res) {
    try {
        const userRecord = await admin.auth().listUsers()
        res.render('admin/listUsers.ejs', { users: userRecord.users, error: false })
    } catch (e) {
        res.render('admin/listUsers.ejs', { users: false, error: e })
    }
}

async function verifyIdToken(idToken) {
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken)
        return decodedIdToken
    } catch (e) {
        return null
    }
}

async function getOrderHistory(decodedIdToken) {
    try {
        const collection = admin.firestore().collection(Constants.COLL_ORDERS)
        let orders = []
        const snapshot = await collection.where("uid", "==", decodedIdToken.uid).orderBy("timestamp").get()
        snapshot.forEach(doc => {
            orders.push(doc.data())
        })
        return orders
    } catch (e) {
        return null
    }
}
async function checkOut(data) {
    data.timestamp = admin.firestore.Timestamp.fromDate(new Date())
    try {
        const collection = admin.firestore().collection(Constants.COLL_ORDERS)
        await collection.doc().set(data)
    } catch (e) {
        throw e
    }
}

//   async function emailInvoice(data, email) {

// var time = data.timestamp.toDate()
// var emailHTML= `
// Order Date :${time}<br>
// <table class="table table-striped">
//         <tr>
//         <th></th>
//             <th>Name</th>
//             <th>Price</th>
//             <th>Qty</th>
//         </tr>`;
//          for(let i = 0; i < data.cart.length; i++) {
//              emailHTML +=`
//              <tr>
//              <td><img src = "${data.cart[i].product.image_url}" height = "50" width ="50"></td>
//              <td>${data.cart[i].product.name} </td>
//              <td>${data.cart[i].product.price}</td>
//              <td>${cart.contents[i].qty}</td>
//          </tr>
//              `
//              }
           
//     emailHTML+= `</table>`;
//     let transporter = nodemailer.createTransport({
//         host : "smtp.gmail.com",
//         port:465,
//         secure: true,
//         auth:{
//             user: "th3blproject@gmail.com",
//             pass: "FriedRice22"
//     }
//     });
//     let info = await transporter.sendMail({
//         from: 'FDAFDASFDA' "<no-reply@wspstore.com>",
//         to: email,
//         subject: " ONLINE INVOICE",
//         text: "YOUR RECEIPT ",
//         html: emailHTML
//     })
//     admin.firestore().collection('mail').add({
//         to: 'email',
//         message: {
//           subject: 'your invoice!',
//           html: `emailHTML`,
//         }
//       }).then(()=>
//       console.log('emil sent')
//       );
// }

module.exports = {
    createUser,
    listUsers,
    verifyIdToken,
    getOrderHistory,
    checkOut,
    // emailInvoice,
}