const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const cors = require("cors");


const app = express();
const port = 5001;

// Connect to Postgres database
const client = new Client({
  user: 'postgres',
  host: 'office-depot-db.cw9nmjmeojrg.us-east-1.rds.amazonaws.com',
  database: 'office_depot_db',
  password: 'office-depot-g7',
  port: 5432,
});
client.connect();

// Define user schema
const userSchema = {
  username: { type: 'string', required: true },
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

// Define user model
const UserModel = {
  async create(user) {
    try {
      // Check if username already exists
      const query = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [user.username],
      };
      const { rowCount } = await client.query(query);
      if (rowCount > 0) {
        throw new Error('Username already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert new user
      const insertQuery = {
        text: 'INSERT INTO users(username, email, password) VALUES($1, $2, $3)',
        values: [user.username, user.email, hashedPassword],
      };
      const result = await client.query(insertQuery);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create user');
    }
  },

  async findByUsername(username) {
      const query = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username],
      };
      const { rows } = await client.query(query);
      return rows[0];
  },
};



// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Define registration endpoint
app.post('/register', async (req, res) => {
  try {
    // Extract user data from request body
    const { username, email, password } = req.body;

    // Validate user data
    if (!username || !email || !password) {
      throw new Error('Invalid user data');
    }

    // Create new user
    const user = { username, email, password };
    await UserModel.create(user);

    // Return success response
    res.status(200).json({ message: 'User created successfully' });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Define login endpoint
app.post('/login', async (req, res) => {
  try {
    // Extract login data from request body
    const { username, password } = req.body;

    // Validate login data
    if (!username || !password) {
      throw new Error('Invalid login data');
    }

    // Find user by username
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error('Invalid username or password');
    }

    // Return success response
    console.log('Login successful');
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req,res) => res.json('My api running. '))
