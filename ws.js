const WS = require("ws"),
wss = new WS.WebSocketServer({
    host:"0.0.0.0",
    port:8080
}),
app = required.app,
isset = required.isset;

var clients = {};

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
                //Mengecek data dari user
                conn.query("SELECT username, data FROM data WHERE username=?", [msg.id], (err, res) => {
                    if(res.length > 0){
                        //Mengirim data ke user
                        WSSend({
                            type:"load",
                            status:true,
                            data:JSON.stringify(res[0].data)
                        });
                    } else {
                        conn.query("INSERT INTO ")
                    }
                });
                if(isset(chat[msg.id])){
                    //Mengirim data ke user
                    WSSend({
                        type:"load",
                        status:true,
                        data:chat[i].data
                    });
                } else {
                    chat.push({
                        me:msg.id,
                        data:{}
                    });
                }
                break;
            //from, to
            case "create":
                conn.query("SELECT username FROM user WHERE username=?", [msg.to],
                (err, res) => {
                    if(err) throw err;
                    if(res.length > 0){
                        if(isset(chat[msg.from]) && isset(chat[msg.from].data[msg.to])){
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
                if(isset(chat[msg.from])){
                    if(!isset(chat[msg.from].data[msg.to])){
                        chat[msg.from].data[msg.to] = [];
                    }
                    chat[msg.from].data[msg.to].push({
                        me:true,
                        message:msg.message
                    });
                } else {
                    if(isset(clients[msg.to])){
                        clients[msg.to].send(JSON.stringify({
                            type:"chat",
                            from:msg.from,
                            message:msg.message
                        }));
                    }
                    if(!isset(chat[msg.from].data[msg.from])){
                        chat[msg.from].data[msg.from] = [];
                    }
                    chat[msg.from].data[msg.from].push({
                        me:false,
                        message:msg.message
                    });
                }
                break;
        }
    });
});