function show_page() {
    auth('prodadmin@test.com', show_page_secured, 'login');
}

let products; // list of products to read from the db

async function show_page_secured() {
    glPageContent.innerHTML = '<h1>Show Products</h1>'
    glPageContent.innerHTML = `
        <a href='/add' class="btn btn-outline-primary">Add a Product</a>
        <a href='/home' class="btn btn-outline-primary">Home</a><br><hr>
        `;

    try {
        products = [];
        const snapshot = await firebase.firestore().collection(COLLECTION).get();
        snapshot.forEach(doc => {
            const { name, summary, price, imageName, image_url } = doc.data();
            const p = { docId: doc.id, name, summary, price, imageName, image_url };
            products.push(p);
        });
    } catch (e) {
        glPageContent.innerHTML = "<h1> Error! Firestore access, please try again later. <br>" + e + "<br></h1>";
        return;
    }

    if (!(products.length > 0)) {
        glPageContent.innerHTML += '<h1> No Products in the database </h1>';
    }

    for (const i in products) {
        const product = products[i];
        if (!product) {
            continue;
        }

        glPageContent.innerHTML += `
            <div id="${product.docId}"class="card" style="width: 18rem; display: inline-block; padding: 10px;">
            <img src="${product.image_url}" class="card-img-top" alt="">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">$${product.price} <br>${product.summary}</p>
                    <button class="btn btn-primary" type="button" onclick="editProduct(${i})">Edit</button>
                    <button class="btn btn-primary" type="button" onclick="deleteProduct(${i})">Delete</button>
                </div>
            </div>
        `;
    }
}

let cardOriginal;
let imageFile2Update;

function editProduct(index) {
    const p = products[index];
    const card = document.getElementById(p.docId);
    cardOriginal = card.innerHTML;
    card.innerHTML = `
        <div class="form-group">
            Name: <input class="form-control" type="text" id="name" value="${p.name}" />
            <p id="name_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Summary: <br>
            <textarea class="form-control" id="summary" cols="40" rows="5">${p.summary}</textarea>
            <p id="summary_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Price: <input class="form-control" type="text" id="price" value="${p.price}" />
            <p id="price_error" style="color:red;"/>
        </div>
        Current Image:<br>
        <img src="${p.image_url}" style="max-width: 265px; max-height: 200px;><br>
        <div class="form-group">
            New Image: <input type="file" value="upload" id="imageButton"/>
        </div>
        <br>
        <button class="btn btn-danger" type="button" onclick="update(${index})">Update</button>
        <button class="btn btn-secondary" type="button" onclick="cancel(${index})">Cancel</button>
    `;

    const imageButton = document.getElementById('imageButton');
    imageButton.addEventListener('change', e => {
        imageFile2Update = e.target.files[0];
    });
}

async function update(index) {
    const p = products[index];
    const newName = document.getElementById('name').value;
    const newSummary = document.getElementById('summary').value;
    const newPrice = document.getElementById('price').value;

    // validate new values
    const nameErrorTag = document.getElementById('name_error');
    const summaryErrorTag = document.getElementById('summary_error');
    const priceErrorTag = document.getElementById('price_error');
    nameErrorTag.innerHTML = validate_name(newName);
    summaryErrorTag.innerHTML = validate_summary(newSummary);
    priceErrorTag.innerHTML = validate_price(newPrice);

    if (nameErrorTag.innerHTML || summaryErrorTag.innerHTML || priceErrorTag.innerHTML) {
        return;
    }

    // ready to update
    let updated = false;
    const newInfo = {};
    if (p.name !== newName) {
        newInfo.name = newName;
        updated = true;
    }
    if (p.summary !== newSummary) {
        newInfo.summary = newSummary;
        updated = true;
    }
    if (p.price !== newPrice) {
        newInfo.price = Number(Number(newPrice).toFixed(2));
        updated = true;
    }
    if (imageFile2Update) {
        updated = true;
    }
    if (!updated) {
        cancel(index);
        return;
    }

    //update database
    try {
        if (imageFile2Update) {
            const imageRef2del = firebase.storage().ref().child(IMAGE_FOLDER + p.imageName);
            await imageRef2del.delete();
            const image = Date.now() + imageFile2Update.name;
            const newImageRef = firebase.storage().ref(IMAGE_FOLDER + image);
            const taskSnapshot = await newImageRef.put(imageFile2Update);
            const image_url = await taskSnapshot.ref.getDownloadURL();
            newInfo.image = image;
            newInfo.image_url = image_url;
        }

        await firebase.firestore().collection(COLLECTION).doc(p.docId).update(newInfo);
        window.location.href = '/show';
    } catch (e) {
        glPageContent.innerHTML = `
            <h1> Error on update! <br> ${JSON.stringify(e)} <br></h1>
        `;
    }
}

function cancel(index) {
    const p = products[index];
    const card = document.getElementById(p.docId);
    card.innerHTML = cardOriginal
}

async function deleteProduct(index) {
    try {
        const p = products[index];
        await firebase.firestore().collection(COLLECTION).doc(p.docId).delete();
        const imageRef = firebase.storage().ref().child(IMAGE_FOLDER + p.imageName);
        await imageRef.delete();

        const card = document.getElementById(p.docId);
        card.parentNode.removeChild(card);

        delete products[index];
    } catch (e) {
        glPageContent.innerHTML = `
            <h1> Error on delete! <br> ${JSON.stringify(e)} <br></h1>
        `;
    }
}