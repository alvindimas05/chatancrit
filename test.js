const axios = require("axios").default || require("axios"),

base_url = "http://localhost/";

axios.post(base_url + "login", {
    username:"tes",
    password:"tes"
}, {
    headers:{
        "Content-Type": "application/x-www-form-urlencoded"
    }
})
.then(res => {
    console.log(res.data);
    process.exit(1);
});