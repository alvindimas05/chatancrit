const conn = require("./mysql"),
required = require("./required"),
WS = require("ws"),
wss = new WS.WebSocketServer({port:8080}),

app = required.app,
isset = required.isset,
randstring = required.randstring;

var clients = {},
chat;

function update_data(){
    conn.query("UPDATE chat SET data=?", [JSON.stringify(chat)], err => {
        if(err) throw err;
    })
}

conn.query("SELECT * FROM chat", (err, res) => {
    if(err) throw err;
    chat = JSON.parse(res[0].data);

    setInterval(() => update_data(), 300000);
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

/*
chat =
[
    {
        users:["abc", "xyz"],
        data:[
            {
                from:0
                read:false
                message:"tes"
            },
            {
                from:1
                read:false,
                message:"tes"
            }
        ]
    }
]
*/
wss.on("connection", ws => {
    ws.on("message", msg => {
        msg = JSON.parse(msg);
        switch(msg.type){
            //id
            case "open":
                clients[msg.id] = ws;
                break;
            //from, to
            case "create":
                conn.query("SELECT user_unique_id FROM user WHERE user_unique_id=?", [msg.to],
                (err, res) => {
                    if(err) throw err;
                    if(res.length > 0){
                        var found = false;
                        for(i in chat){
                            if(chat[i].users[0] == msg.from || chat[i].users[0] == msg.to && chat[i].users[1] == msg.to || chat[i].users[1] == msg.from){
                                found = true;
                                break;
                            }
                        }
                        if(!found){
                            chat.push({
                                users:[msg.from, msg.to],
                                data:[]
                            });
                            update_data();
                        }
                    }
                });
                break;
            //from, to, message
            case "chat":
                var a;
                for(i in chat){
                    if(chat[i].users[0] == msg.from || chat[i].users[1] == msg.to && chat[i].users[1] == msg.to || chat[i].users[1] == msg.from){
                        a = i;
                        break;
                    }
                }
                for(i in chat[a].users){
                    if(chat[a].users[i] == msg.from){
                        chat[a].data.push({
                            from:i,
                            read:false,
                            message:msg.message
                        });
                        update_data();
                        break;
                    }
                }
                break;
            //from, to
            case "read":
                var a;
                for(i in chat){
                    if(chat[i].users[0] == msg.from || chat[i].users[1] == msg.to && chat[i].users[1] == msg.to || chat[i].users[1] == msg.from){
                        a = i;
                        break;
                    }
                }
                for(i in chat[a].users){
                    if(chat[a].users[i] == msg.from){
                        for(j in chat[a].data){
                            if(chat[a].data[j].from == j){
                                chat[a].data[j].read = true;
                            }
                        }
                        break;
                    }
                }
                break;
        }
    });
});

app.listen(80, () => console.log("Listening on 80"));