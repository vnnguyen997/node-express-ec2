const express = require('express');
const session = require('express-session');
const cors = require("cors");

const app = express();

app.use(cors());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false},
}));

app.get('/set-session', (req, res) => {
    req.session.myVariable = 'Hello from session!';
    res.send('Session variable set.');
  });


app.get('/get-session', (req, res) => {
    const myVariable = req.session.myVariable;
    res.cookie('myCookie', myVariable);
    res.send('Cookie sent.');
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});