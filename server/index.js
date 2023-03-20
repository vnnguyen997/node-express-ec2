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
  // register users
  async create(user) {
    try {
      // Check if email already exists
      const query = {
        text: 'SELECT * FROM customer WHERE email = $1',
        values: [user.email],
      };
      const { rowCount } = await client.query(query);
      if (rowCount > 0) {
        throw new Error('Email already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert new user
      const insertQuery = {
        text: 'INSERT INTO customer(firstname, lastname, email, password, shippingaddress, creditcard) VALUES($1, $2, $3, $4, $5, $6)',
        values: [user.firstname, user.lastname, user.email, hashedPassword, user.shippingaddress, user.creditcard],
      };
      const result = await client.query(insertQuery);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create customer');
    }
  },


  async findByEmail(email) {
      const query = {
        text: 'SELECT * FROM customer WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      return rows[0];
  },
};

const EmployeeModel = { 
  // create employee
  async createEmployee(employee) {
    try {
      // Check if employee already exists
      const query = {
        text: 'SELECT * FROM employee WHERE email = $1',
        values: [employee.email],
      };
      const { rowCount } = await client.query(query);
      if (rowCount > 0) {
        throw new Error('employee already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(employee.password, 10);

      // Generate a new employee ID
      //const employeeId = uuidv4();

      // Insert new employee
      const insertQuery = {
        text: 'INSERT INTO employee(firstname, lastname, email, password) VALUES($1, $2, $3, $4)',
        values: [employee.firstname, employee.lastname, employee.email, hashedPassword],
      };
      const result = await client.query(insertQuery);
      console.log(result);

    } catch (err) {
      console.error(err);
      throw new Error('Failed to create employee');
    }
  },

    async findByEmail(email) {
      const query = {
        text: 'SELECT * FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      return rows[0];
  },
};

// Define user model
const InventoryModel = {
  async create(item) {
    try {
      // Insert new item
      const insertQuery = {
        text: 'INSERT INTO inventory(name, description, weight, price, itemgroup) VALUES($1, $2, $3, $4, $5) RETURNING *',
        values: [item.name, item.description, item.weight, item.price, item.itemgroup],
      };
      const { rows } = await client.query(insertQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create item');
    }
  },

  async updateName(itemId, name) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET name = $1 WHERE inventory_id = $2 RETURNING *',
        values: [name, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update name');
    }
  },

  async updateDescription(itemId, description) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET description = $1 WHERE inventory_id = $2 RETURNING *',
        values: [description, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update description');
    }
  },

  async updateWeight(itemId, weight) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET weight = $1 WHERE inventory_id = $2 RETURNING *',
        values: [weight, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update weight');
    }
  },

  async updatePrice(itemId, price) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET price = $1 WHERE inventory_id = $2 RETURNING *',
        values: [price, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update price');
    }
  },

  async updateItemGroup(itemId, itemGroup) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET item_group = $1 WHERE inventory_id = $2 RETURNING *',
        values: [itemGroup, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update item group');
    }
  },
};



// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint for user registration
app.post('/register', async (req, res) => {
  try {
    // Extract user data from request body
    const { firstname, lastname, email, password, shippingaddress, creditcard } = req.body;

    // Validate user data
    if (!firstname || !lastname || !email || !password || !shippingaddress || !creditcard) {
      throw new Error('Invalid user data');
    }

    // Create new user
    const user = { firstname, lastname, email, password, shippingaddress, creditcard };
    await UserModel.create(user);

    // Return success response
    res.status(200).json({ message: 'User created successfully' });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for user login
app.post('/login', async (req, res) => {
  try {
    // Extract login data from request body
    const { email, password } = req.body;


    // Validate login data
    if (!email || !password) {
      throw new Error('Invalid login data');
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
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

// Endpoint for employee creation
app.post('/employeeCreate', async (req, res) => {
  try {
    // Extract employee data from request body
    const { firstname, lastname, email, password } = req.body;

    // Validate employee data
    if (!firstname || !lastname || !email || !password) {
      throw new Error('Invalid employee data');
    }

    // Create new employee
    const employee = { firstname, lastname, email, password };
    await EmployeeModel.createEmployee(employee);

    // Return success response
    res.status(200).json({ message: 'Employee created successfully' });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for employee login
app.post('/employeeLogin', async (req, res) => {
  try {
    // Extract login data from request body
    const { email, password } = req.body;

    // Validate login data
    if (!email || !password) {
      throw new Error('Invalid login data');
    }

    // Find employee by email
    const employee = await EmployeeModel.findByEmail(email);
    if (!employee) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    // Return success response
    console.log('Employee login successful');
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// Endpoint to create a new inventory item
app.post('/createInventory', async (req, res) => {
  try {
    const item = req.body;
    const newItem = await InventoryModel.create(item);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's name
app.patch('/inventory/:itemId/name', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const name = req.body.name;
    const updatedItem = await InventoryModel.updateName(itemId, name);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's description
app.patch('/inventory/:itemId/description', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const description = req.body.description;
    const updatedItem = await InventoryModel.updateDescription(itemId, description);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's weight
app.patch('/inventory/:itemId/weight', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const weight = req.body.weight;
    const updatedItem = await InventoryModel.updateWeight(itemId, weight);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's price
app.patch('/inventory/:itemId/price', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const price = req.body.price;
    const updatedItem = await InventoryModel.updatePrice(itemId, price);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's item group
app.patch('/inventory/:itemId/item-group', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const itemGroup = req.body.itemGroup;
    const updatedItem = await InventoryModel.updateItemGroup(itemId, itemGroup);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req,res) => res.json('My api running. '))
