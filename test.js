const axios = require("axios").default || require("axios");

axios.post("http://localhost/create", {
    username:"test",
    password:"test",
    vpassword:"test"
}, {
    headers:{
        "Content-Type":"application/x-www-form-urlencoded"
    }
}).then(res => console.log(res.data));