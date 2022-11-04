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
    setInterval(() => {
        for(i in clients) clients[i].send(JSON.stringify({type:"ping"}));
    }, 25000)
    ws.on("message", async msg => {
        msg = JSON.parse(msg);
        switch(msg.type){
            //id
            case "open":
                clients[msg.id] = ws;
                var data = (await Data.findOne({username:msg.id})).data;
                if(data === null) data = {};
                WSSend({
                    type:"load",
                    data:data
                });
                break;
            //from, to
            case "create":
                if((await User.find({username:msg.to})).length > 0){
                    var to = await Data.findOne({username:msg.from});

                    if(to.data === null) to.data = {};
                    if(to.data[msg.to] !== undefined)
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
                        await Data.findOneAndUpdate({username:msg.from}, {data:to.data});

                        var online = await Data.findOne({username:msg.from});
                        online.data.push(msg.to);
                        await Data.findOneAndUpdate({username:msg.from}, {data:online});
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
                var chat = await Data.findOne({username:msg.from});

                chat.data[msg.to].push({
                    me:true,
                    message:msg.message
                });
                await Data.findOneAndUpdate({username:msg.from}, {data:chat.data});

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                chat = await Data.findOne({username:msg.to});

                if(chat.data == null) chat.data = {};
                if(!isset(chat.data[msg.from])){
                    chat.data[msg.from] = [];
                }
                chat.data[msg.from].push({
                    me:false,
                    message:msg.message
                });
                await Data.findOneAndUpdate({username:msg.to}, {data:chat.data});
                break;
        }
    });
    ws.on("close", msg => {
        for(i in clients){
            if(clients[i] == msg){
                delete clients[i];
                break;
            }
        }
    });
});

console.log("Listening on 8080");