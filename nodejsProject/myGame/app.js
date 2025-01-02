const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');

app.use(express.urlencoded({
  extended:false
}));

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

//Login Form creations
app.post("/loginform", (req, res) => {
  if (req != null) {
    console.log("username:" + req.body.username);
    console.log("pwd:" + req.body.pwd);

    const username = req.body.username;
    const password = req.body.pwd;

    // Query the database for the user
    const query = `SELECT * FROM user WHERE username = ? AND password = ?`;
    con.query(query, [username, password], (err, results) => {
      if (err) {
        console.error("Error querying user:", err);
        return res.sendFile(__dirname + '/static/HTML/404.html');
      }

      if (results.length > 0) {
        // Successful login
        console.log("User logged in successfully:", username);
        res.redirect('/game');
      } else {
        // Invalid credentials
        console.log("Invalid username or password.");
        res.sendFile(__dirname + '/static/HTML/404.html');
      }
    });
  } else {
    res.sendFile(__dirname + '/static/HTML/404.html');
  }
});

//Register Forms creations
app.post("/registerform", (req, res) => {
  if (req != null) {
    console.log("username:" + req.body.username);
    console.log("pwd:" + req.body.pwd);
    console.log("Comfirmpwd:" + req.body.Comfirmpwd);

    const username = req.body.username;
    const password = req.body.pwd;
    const confirmPassword = req.body.Comfirmpwd;

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords do not match.");
      return res.sendFile(__dirname + '/static/HTML/404.html');
    }

    // Insert the new user into the database
    const query = `INSERT INTO user (username, password) VALUES (?, ?)`;
    con.query(query, [username, password], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.sendFile(__dirname + '/static/HTML/404.html');
      }

      console.log("User registered successfully:", username);
      res.redirect('/login');
    });
  } else {
    res.sendFile(__dirname + '/static/HTML/404.html');
  }
});

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