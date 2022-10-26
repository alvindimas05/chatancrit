const conn = require("./mysql"),
required = require("./required"),
WS = require("ws"),
wss = new WS.WebSocketServer({port:8080}),

app = required.app,
isset = required.isset,
randstring = required.randstring;

var clients = {},
chat = [];

/*
chat =
[
    {
        from:"abc",
        to:"xyz",
        data:[
            {
                read:false
                message:"tes"
            },
            {
                read:false,
                message:"tes"
            }
        ]
    }
]
*/

conn.query("SELECT * FROM chat", (err, res) => {
    if(err) throw err;
    chat = JSON.parse(res[0])

    setInterval(() => {
        conn.query("UPDATE SET data=?", [JSON.stringify(chat)], err => {
            if(err) throw err;
        })
    }, 300000);
});

app.post("/create", (req, res) => {
    //username, password, vpassword
    if(isset(req.body.username) && isset(req.body.password) && isset(req.body.vpassword)){
        if(req.body.password == req.body.vpassword){
            conn.query("SELECT username FROM user WHERE username=?", [req.body.username],
            (err, rem) => {
                if(err) throw err;
                if(rem.length > 0){
                    //status, message
                    res.json({
                        status:false,
                        message:"Username already used!"
                    })
                } else {
                    var id = randstring();
                    conn.query("INSERT INTO user(user_unique_id, username, password, display_name) VALUES(?,?,?,?)",
                    [id, req.body.username, req.body.password, req.body.username], err => {
                        if(err) throw err;
                        //status
                        res.json({
                            status:true
                        });
                    });
                }
            });
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
    if(isset(req.body.username) && isset(req.body.password)){
        conn.query("SELECT user_unique_id FROM user WHERE username=? AND password=?",
        [req.body.username, req.body.password], (err, rem) => {
            if(err) throw err;
            if(rem.length > 0)
            //status, id
            res.json({
                status:true,
                id:rem[0].user_unique_id
            });
            //status
            else res.json({status:false});
        });
    }
});

wss.on("connection", ws => {
    ws.on("message", msg => {
        msg = JSON.parse(msg);
        switch(msg.type){
            //id
            case "open":
                clients[msg.id] = ws;
                break;
            //from, to, message
            case "chat":
                if(isset(clients[msg.to])){
                    clients[msg.to].send(JSON.stringify({
                        type:"chat",
                        message:msg.message
                    }));
                }
                for(i in chat){
                    if(chat[i].from == msg.from && chat[i].to == msg.to){
                        chat[i].data.push({
                            read:false,
                            message:msg.message
                        });
                    }
                }
                break;
            case "read":
                for(i in chat){
                    //from, to
                    if(chat[i].to == msg.from && chat[i].from == msg.to){
                        for(j in chat[i].data){
                            chat[i].data[i].read = true;
                        }
                        break;
                    }
                }
                break;
        }
    });
});

app.listen(80, () => console.log("Listening on 80"));