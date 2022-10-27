const conn = require("./mysql");

conn.query("INSERT INTO chat (data) VALUES ('" + JSON.stringify({}) + "')");