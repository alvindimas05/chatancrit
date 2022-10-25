const conn = require("./mysql"),
app = require("./required");

app.post("/create", (req, res) => {
    //username, password, vpassword
    if(isset(req.body.username) && isset(req.body.password) && isset(req.body.vpassword)){
        if(req.body.password == req.body.vpassword){
            var found = false;
            conn.query("SELECT username FROM user WHERE username=?", [req.body.username],
            (err, rem) => {
                if(err) throw err;
                if(rem.length > 0) found = true;
            });
            if(found){
                res.json({
                    status:false,
                    message:"Username already used!"
                })
            } else {
                var id = randstring();
                conn.query("INSERT INTO user(user_unique_id, username, password, display_name) VALUES(?,?,?,?)",
                [id, req.body.username, req.body.password, req.body.username], err => {
                    if(err) throw err;
                    res.json({
                        status:true
                    });
                });
            }
        } else {
            res.json({
                status:false,
                message:"Password verification is not same!"
            })
        }
    }
});

app.post("/login", (req, res) => {
    //username, password
    if(isset(req.body.username) && isset(req.body.password)){
        conn.query("SELECT user_unique_id FROM user WHERE username=? AND password=?",
        [req.body.username, req.body.password], (err, rem) => {
            if(err) throw err;
            if(rem.length > 0)
                res.json({
                    status:true,
                    id:rem.user_unique_id
                });
            else res.json({status:false});
        });
    }
});
app.listen(80, () => console.log("Listening on 80"));