const WS = require("ws"),
db = require("./db"),
User = db.User,
Data = db.Data,
wss = new WS.WebSocketServer({
    host:"0.0.0.0",
    port:8080
}),
isset = require("./required").isset;

var clients = {};

wss.on("connection", ws => {
    function WSSend(obj){
        ws.send(JSON.stringify(obj));
    }
    ws.on("message", async msg => {
        msg = JSON.parse(msg);
        switch(msg.type){
            //id
            case "open":
                clients[msg.id] = ws;
                var data = (await Data.find({username:msg.id})).data;
                WSSend({
                    type:"load",
                    data:data
                });
                break;
            //from, to
            case "create":
                if((await User.find({username:msg.to})).length > 0){
                    var to = await Data.find({username:msg.from});
                    if(isset(to.data[msg.to]))
                    WSSend({
                        type:"create",
                        status:false,
                        message:"Chat already created!"
                    });
                    else {
                        WSSend({
                            type:"create",
                            status:true,
                            id:msg.to
                        });
                        to.data[msg.to] = [];
                        await Data.findOneAndUpdate({username:msg.from}, to.data);
                    }
                } else 
                WSSend({
                    type:"create",
                    status:false,
                    message:"User not found!"
                });
                break;
            //from, to, message
            case "chat":
                if(isset(clients[msg.to])){
                    clients[msg.to].send(JSON.stringify({
                        type:"chat",
                        from:msg.from,
                        message:msg.message
                    }));
                }
                var chat = await Data.find({username:msg.from});

                chat.data[msg.to].push({
                    me:true,
                    message:msg.message
                });
                await Data.findOneAndUpdate({username:msg.from}, chat);

                chat = await Data.find({username:msg.to});

                if(!isset(chat.data[msg.from])){
                    chat.data[msg.from] = [];
                }
                chat.data[msg.from].push({
                    me:false,
                    message:msg.message
                });
                await Data.findOneAndUpdate({username:msg.to}, chat);
                break;
        }
    });
});

console.log("Listening on 8080");