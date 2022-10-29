const conn = require("./mysql"),
required = require("./required"),
WS = require("ws"),
wss = new WS.WebSocketServer({
    host:"0.0.0.0",
    port:8080
}),

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
    //username, password,
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
        me:"abc",
        data:{
            "xyz":[
                {
                    me:false,
                    message:"tes"
                },
                {
                    me:true,
                    message:"tes"
                }
            ]
            "def":[]
        }
    }
]
*/
wss.on("connection", ws => {
    function WSSend(obj){
        ws.send(JSON.stringify(obj));
    }
    ws.on("message", msg => {
        msg = JSON.parse(msg);
        switch(msg.type){
            //id
            case "open":
                clients[msg.id] = ws;
                var found = false;
                //Mengecek data dari user
                for(i in chat){
                    //Jika user ada, data dikirim
                    if(chat[i].me == msg.id){
                        found = true;
                        WSSend({
                            type:"load",
                            status:true,
                            data:chat[i].data
                        });
                    }
                }
                //Jika user tidak ada, data dibuat
                if(!found){
                    chat.push({
                        me:msg.id,
                        data:{}
                    });
                }
                break;
            //from, to
            case "create":
                conn.query("SELECT user_unique_id FROM user WHERE user_unique_id=?", [msg.to],
                (err, res) => {
                    if(err) throw err;
                    if(res.length > 0){
                        var found = false;
                        for(i in chat){
                            if(chat[i].me == msg.from && isset(chat[i].data[msg.to])){
                                found = true;
                                break;
                            }
                        }
                        if(found){
                            WSSend({
                                type:"create",
                                status:false,
                                message:"Chat already created!"
                            });
                        } else {
                            chat[i].data[msg.from] = [];
                            WSSend({
                                type:"create",
                                status:true,
                                id:msg.to
                            });
                        }
                    } else {
                        WSSend({
                            type:"create",
                            status:false,
                            message:"User not found!"
                        });
                    }
                });
                break;
            //from, to, message
            case "chat":
                var found = false;
                for(i in chat){
                    if(chat[i].me == msg.from){
                        if(!isset(chat[i].data[msg.to])){
                            chat[i].data[msg.to] = [];
                        }
                        chat[i].data[msg.to].push({
                            me:true,
                            message:msg.message
                        });
                    } else if(chat[i].me == msg.to){
                        if(isset(clients[msg.to])){
                            clients[msg.to].send(JSON.stringify({
                                type:"chat",
                                from:msg.from,
                                message:msg.message
                            }));
                        }
                        if(!isset(chat[i].data[msg.from])){
                            chat[i].data[msg.from] = [];
                        }
                        chat[i].data[msg.from].push({
                            me:false,
                            message:msg.message
                        });
                    }
                }
                break;
        }
    });
});

app.listen(80, () => console.log("Listening on 80"));