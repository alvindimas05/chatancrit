const mysql = require("mysql");

//Membuat koneksi mysql
var conn = mysql.createConnection({
    host:"0.0.0.0",
    user:"root",
    password:"adp050107",
    database:"chatancrit"
});

//Mengecek apakah koneksi mysql error atau tidak
conn.connect(err => {
   if(err) throw err;
});

module.exports = conn;