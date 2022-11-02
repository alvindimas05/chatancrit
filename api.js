const db = require("./db"),
User = db.User,
Data = db.Data,
required = require("./required"),

app = required.app,
isset = required.isset;

app.post("/create", async (req, res) => {
    //username, password, vpassword
    var body = req.body;
    if(isset(body.username) && isset(body.password) && isset(body.vpassword)){
        if(body.password == body.vpassword){
            var data = await User.find({
                username:body.username,
                password:body.password
            });

            if(data.length > 0)
            //status, message
            res.json({
                status:false,
                message:"Username already used!"
            });
            else {
                await (new User({
                    username:body.username,
                    password:body.password,
                    online:""
                })).save();
                await (new Data({
                    username:body.username,
                    data:{}
                })).save();
                res.json({status:true});
            }
        } else
        //status, message
        res.json({
            status:false,
            message:"Password verification is not same!"
        });
    }
});

app.post("/login", async (req, res) => {
    //username, password
    var body = req.body;
    if(isset(body.username) && isset(body.password)){
        var data = await User.find({
            username:body.username
        });
        res.json({
            status:data.length > 0 ? true : false
        });
    }
});

app.listen(80, () => console.log("Listening on 80"));