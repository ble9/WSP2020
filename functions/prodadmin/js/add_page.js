function add_page() {
    add_page_secured();

}
let glImageFile2Add; // file selected by image uplaod button


function add_page_secured() {
    glPageContent.innerHTML = '<h1>Add Page</h1>';
    glPageContent.innerHTML = `
        <a href='/home' class="btn btn-outline-primary">Home</a>
        <a href='/show' class="btn btn-outline-primary">Show Products</a>
        <button class="btn btn-outline-danger type="button" onclick="logOut()">Log Out</button>
        <div class="form-group">
            Name: <input class="form-control" type="text" id="name"/>
            <p id="name_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Summary: <br>
            <textarea class="form-control" id="summary" cols="40" rows="5"></textarea>
            <p id="summary_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Price: <input class="form-control" type="text" id="price" />
            <p id="price_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Name: <input type="file" value="upload" id="imageButton"/>
            <p id="image_error" style="color:red;"/>
        </div>
    `;

    const imageButton = document.getElementById('imageButton');
    imageButton.addEventListener('change', e => {
        glImageFile2Add = e.target.files[0];
    });
}

async function addProduct() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hide-class');

    const name = document.getElementById('name').value;
    const summary = document.getElementById('summary').value;
    const price = document.getElementById('price').value; //was const

    const nameErrorTag = document.getElementById('name_error');
    const summaryErrorTag = document.getElementById('summary_error');
    const priceErrorTag = document.getElementById('price_error');
    const imageErrorTag = document.getElementById('image_error');

    //validation 
    nameErrorTag.innerHTML = validate_name(name);
    summaryErrorTag.innerHTML = validate_summary(summary);
    priceErrorTag.innerHTML = validate_price(price);
    imageErrorTag.innerHTML = !glImageFile2Add ? 'Error: Image file not selected' : null;

    if (nameErrorTag.innerHTML || summaryErrorTag.innerHTML ||
        priceErrorTag.innerHTML || imageErrorTag.innerHTML
    ) {
        return;
    }

    // add the product, all is validated!
    try {
        const imageName = Date.now() + glImageFile2Add.name; // unique name generator
        const ref = firebase.storage().ref(IMAGE_FOLDER + image);
        const taskSnapshot = await ref.put(glImageFile2Add);
        const image_url = await taskSnapshot.ref.getDownloadURL();

        // product: name, summary, price in firestore database. image already stored
        price = Number(price);
        await firebase.firestore().collection(COLLECTION).doc()
            .set({ name, summary, price, imageName, image_url, });

        glPageContent.innerHTML = `
            <h1>${name} is added.</h1>
            <a href="/show" class="btn btn-outline-primary">Show All</a>
        `;
    
    }catch (e) {
        glPageContent.innerHTML = `
        <h1>Cannot add a product!</h1> 
         ${JSON.stringify(e)} `
    }
}