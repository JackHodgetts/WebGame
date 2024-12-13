const express = require('express');
const app = express();
const port = 3000;

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cmp5360"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

app.use(express.static('myGame/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/HTML/Index.html')
})

app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/static/HTML/game.html')
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/static/HTML/login.html')
})

app.get('/gameloading', (req, res) => {
  res.sendFile(__dirname + '/static/HTML/gameloading.html')
})

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/static/HTML/Register.html')
})

app.get('/some', (req, res) => {
    res.send('Change a word!')
})

app.get('/test', (req, res) => {
    res.send('This is test page')
})

app.get('*', function(req, res){
  res.status(404).sendFile(__dirname + '/static/HTML/404.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})