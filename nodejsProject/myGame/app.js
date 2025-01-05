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

app.use(express.json());

app.post('/score', (req, res) => {
  console.log("Received request body:", req.body);  // Debugging line

  const { score } = req.body;  // Extract score from request

  if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score data" });
  }

  const username = "User3";  // Replace with actual logged-in user

  const query = `UPDATE user SET score = ? WHERE username = ?`;
  con.query(query, [score, username], (err, result) => {
      if (err) {
          console.error("Error updating score:", err);
          return res.status(500).json({ error: "Database error" });
      }

      console.log(`Score updated successfully: ${score} for user ${username}`);
      res.json({ message: "Score updated successfully." });
  });
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

// Hashing the passwords before being saved in the database
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hashing password before storing
bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
  if (err) throw err;

});

// During login, compare password with stored hashed password
bcrypt.compare(password, storedHashedPassword, function(err, result) {
  if (result) {

  } else {

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