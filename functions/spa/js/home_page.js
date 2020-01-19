function home_page() {
  pageContent.innerHTML =`

  <h1>SEND ME MONEY</h1>
    <form>
      <div class="form-group">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon1">Your Name</span>
          </div>
          <input type="text" class="form-control" placeholder="First Name, Last Name" aria-label="Username" aria-describedby="basic-addon1">
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon2">Email Address</span>
            <input type="text" class="form-control" placeholder="Please enter Email" aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
              </div>
              </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)">
                <div class="input-group-append">
                  <span class="input-group-text">.00</span>
                </div>
                    </div>
              <div class="input-group front ">
                <div class="input-group-prepend">
                  <span class="input-group-text">Reason For sending</span>
                </div>
                <textarea class="form-control" placholder=" comments" aria-label="comments"></textarea>
                <button onclick="myFunction()">Submit</button>
                </div>
                </div>

</form>`
              }
             