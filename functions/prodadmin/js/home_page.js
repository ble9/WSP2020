function home_page() {
    glPageContent.innerHTML = `<h1>Home Page</h1>`
    home_page_secured()
}

function home_page_secured() {
    glPageContent.innerHTML = `<h1>Home Page</h1>`
    glPageContent.innerHTML = `
    <a href ='/add' class=  "btn btn-outline-primary" data-toggle="modal" data-target=" #addModal" data-backdrop="false">  Add A Product </a>    
    <a href ='/show' class= "btn btn-outline-primary" > Show A Products </a>    
    <button class= "btn btn-outline-danger" type= "button" onclick= "logOut()"> Log Out </button>
    
    <div class="modal" id="addModal" tabindex="-1" role="dialog" aria-labelledby="addModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addModalLabel">New Product</h5>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form>
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
        Image : <input type="file" id="imageButton" onchange="previewFile()">
        <br>
    <img src="" height="200" alt="Image preview...">
        <p id="image_error" style="color:red;"/>
    </div>
    <button class="btn btn-primary" type="button" onclick="addProduct()"> Add</button>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`
    ;

    const imageButton = document.getElementById('imageButton');
    imageButton.addEventListener('change', e => {
        glImageFile2Add = e.target.files[0]
    });
}

async function logOut() {
    try {
        await firebase.auth().signOut()
        window.location.href = '/login'
    } catch (e) {
        window.location.href = '/login'

    }
}

