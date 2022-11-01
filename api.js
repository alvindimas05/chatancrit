const db = require("./firebase"),
required = require("./required"),

app = required.app,
isset = required.isset;

app.post("/create", (req, res) => {
    //username, password, vpassword
    var body = req.body;
    //Mengecek request parameters
    if(isset(body.username) && isset(body.password) && isset(body.vpassword)){
        //Mengecek jika verifikasi password sama
        if(body.password == body.vpassword){
            var found = false,
            coll = db.collection("users");

            //Mengecek jika username sudah dipakai
            coll.doc(body.username).get()
            .then(rel => {
                if(rel.exists) found = true;
            });

            if(found)
            //status, message
            res.json({
                status:false,
                message:"Username already used!"
            })
            else {
                coll.doc(body.username).set({
                    password:body.password,
                    online:null
                });
                res.json({status:true});
            }
        } else {
            //status, message
            res.json({
                status:false,
                message:"Password verification is not same!"
            })
        }
    }
});

app.post("/login", (req, res) => {
    //username, password
    var body = req.body;
    //Mengecek request parameters
    if(isset(body.username) && isset(body.password)){
        //Mengecek jika data ada
        db.collection("users").doc(body.username).get()
        .then(rel => {
            if(rel.exists && rel.password == body.password)
            //status, id
            res.json({
                status:true,
                id:rem[0].username
            });
            //status
            else res.json({status:false});
        })
    }
});

app.listen(80, () => console.log("Listening on 80"));