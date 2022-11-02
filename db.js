const mongoose = require("mongoose"),

username = "alvindimas05",
password = "adp050107",
database = "chat",

db = mongoose.createConnection(`mongodb+srv://${username}:${password}@chatancrit.yx0iwsi.mongodb.net/${database}`),

userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  online:String
}),

dataSchema = new mongoose.Schema({
  username:String,
  data:Object
}),

User = db.model("users", userSchema),
Data = db.model("datas", dataSchema);

module.exports = {
  User:User,
  Data:Data
}