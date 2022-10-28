const express = require("express"),
bodyparser = require("body-parser"),
conn = require("./mysql");
cors = require("cors"),
app = express();

//Random string untuk membuat unique id
function randstring(length = 20) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function isset(arg){
    return arg === undefined ? false : true;
}

app.use(bodyparser.urlencoded({extended:false}));
app.use(cors());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/login.html")
});

module.exports = {
    app:app,
    randstring:randstring,
    isset:isset,
    conn:conn
};