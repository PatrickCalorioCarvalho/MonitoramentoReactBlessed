const mqtt = require('mqtt')
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.18.176",
  user: "root",
  password: "*P4ssw0rd",
  database: "Clima"
});
con.connect();
const client = mqtt.connect('mqtt://192.168.18.176:1883')
client.on('connect', () => {
    client.subscribe(['#'])
})

client.on('message', (topic, payload) => {
    var sql = "INSERT INTO Monitoramento (Topico, Valor, DataInclusao) VALUES ('"+topic+"', '"+payload.toString()+"',NOW())";
    con.query(sql);
})