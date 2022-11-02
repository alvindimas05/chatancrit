const axios = require("axios").default || require("axios"),
base_url = "http://localhost/",
headers = {
    headers:{
        "Content-Type":"application/x-www-form-urlencoded"
    }
}

axios.post(base_url + "create", {
    username:"test",
    password:"test",
    vpassword:"test"
}, headers)
.then(res => console.log(res.data.status));

axios.post(base_url + "create", {
    username:"user",
    password:"user",
    vpassword:"user"
}, headers)
.then(res => console.log(res.data.status));