const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const cors = require("cors");
const session = require('express-session');
const store = new session.MemoryStore();

const app = express();
const port = 5001;

// Connect to Postgres database
const client = new Client({
  user: 'postgres',
  host: 'office-depot-db.ch4cpqr7r6fy.us-east-1.rds.amazonaws.com',
  database: 'newDB',
  password: 'PostGres456!',
  port: 5432,
});
client.connect();

app.set("trust proxy", 1);

// Session middleware
const sessionConfig = {
  name: 'Team7isthebest',
  secret: 'some secret', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 600000, // Session duration in milliseconds (30 days in this case)
    sameSite: 'lax',
    httpOnly: false,
    secure: false,
  },
  store
};

// Configure middleware
app.use(cors());
app.use(session(sessionConfig));
app.use(bodyParser.json());


app.get('/example', (req, res) => {
  // Set a cookie in the response
  res.cookie('my_cookie', 'hello world', { maxAge: 600000, sameSite: "lax", httpOnly: false, secure: false });

  // Send a response to the client
  res.send('Response sent');
});

// Define user schema
const userSchema = {
  username: { type: 'string', required: true },
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~CUSTOMER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

  // Update customer page
  async updateCustomer(email, updateFields) {
    try {
      const customer = await client.query('SELECT * FROM customer WHERE email = $1', [email]);
      if (customer.rowCount === 0) {
        throw new Error('Customer not found');
      }
  
      const updateQuery = {
        text: 'UPDATE customer SET firstname = $1, lastname = $2, email = $3, password = $4, shippingaddress = $5, creditcard = $6 WHERE email = $7 RETURNING *',
        values: [
          updateFields.firstname || customer.rows[0].firstname,
          updateFields.lastname || customer.rows[0].lastname,
          updateFields.email || customer.rows[0].email,
          updateFields.password ? await bcrypt.hash(updateFields.password, 10) : customer.rows[0].password,
          updateFields.shippingaddress || customer.rows[0].shippingaddress,
          updateFields.creditcard || customer.rows[0].creditcard,
          email
        ]
      };
  
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update customer');
    }
  },

  // Find customer by email
  async findByEmail(email) {
      const query = {
        text: 'SELECT * FROM customer WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      return rows[0];
  },

  // Display all customers
  async displayCustomers() {
    // Define the SELECT query to retrieve all rows from the "customer" table
    const query = {
      text: 'SELECT * FROM customer',
    };
  
    // execute
    const { rows } = await client.query(query);

    // return rows
    return rows;
  },


  // Delete customer by email
  async removeCustomer(email) {
    try {
      // Find the customer with the given email
      const customer = await UserModel.findByEmail(email);
      if (!customer) {
        throw new Error('Customer not found');
      }
  
      // Delete the customer
      const query = {
        text: 'DELETE FROM customer WHERE email = $1',
        values: [email],
      };
      const result = await client.query(query);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to remove customer');
    }
  },

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~EMPLOYEE STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

  // Find employee by email
    async findByEmail(email) {
      const query = {
        text: 'SELECT * FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      return rows[0];
  },

  // display emplopyees
  async displayEmployees() {
    // Define the SELECT query to retrieve all rows from the "employee" table
    const query = {
      text: 'SELECT * FROM employee',
    };
  
    // Execute
    const { rows } = await client.query(query);
  
    // Return rows
    return rows;
  },

  // Update employee page 
  async updateEmployee(email, updateFields) {
    try {
      const employee = await client.query('SELECT * FROM employee WHERE email = $1', [email]);
      if (employee.rowCount === 0) {
        throw new Error('Employee not found');
      }
  
      // Update the employee fields with the new values, or keep the old value if the field is not provided
      const updateQuery = {
        text: 'UPDATE employee SET firstname = $1, lastname = $2, email = $3, password = $4 WHERE email = $5 RETURNING *',
        values: [
          updateFields.firstname || employee.rows[0].firstname,
          updateFields.lastname || employee.rows[0].lastname,
          updateFields.email || employee.rows[0].email,
          updateFields.password ? await bcrypt.hash(updateFields.password, 10) : employee.rows[0].password,
          email,
        ],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update employee');
    }
  },

  // Delete employee by email
  async removeEmployee(email) {
    try {
      // Find the employee with the given email
      const employee = await EmployeeModel.findByEmail(email);
      if (!employee) {
        throw new Error('Employee not found');
      }
  
      // Delete the employee
      const query = {
        text: 'DELETE FROM employee WHERE email = $1',
        values: [email],
      };
      const result = await client.query(query);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to remove employee');
    }
  },

  // get employee id
  async getEmployeeID(email) {
    try {
      const query = {
        text: 'SELECT employee_id FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].employee_id;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get employee id');
    }
  },

  // get user first name
  async getEmployFirstName(email) {
    try {
      const query = {
        text: 'SELECT firstname FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].firstname;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get employee first name');
    }
  },

  // get user last name
  async getEmployLastName(email) {
    try {
      const query = {
        text: 'SELECT lastname FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].lastname;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get employee last name');
    }
  },

  // get user shippingaddress
  async getEmployAddress(email) {
    try {
      const query = {
        text: 'SELECT address FROM employee WHERE email = $1',
        values: [email],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].address;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get employee address');
    }
  },

  // update Employee firstname
  async updateEmployFirstName(employeeId, firstName) {
    try {
      const updateQuery = {
        text: 'UPDATE employees SET firstname = $1 WHERE employee_id = $2 RETURNING *',
        values: [firstName, employeeId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update employee first name');
    }
  },

  // update Employee last name
  async updateEmployLastName(employeeId, lastName) {
    try {
      const updateQuery = {
        text: 'UPDATE employees SET lastname = $1 WHERE employee_id = $2 RETURNING *',
        values: [lastName, employeeId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update employee last name');
    }
  },

  // update Employee address
  async updateEmployAddress(employeeId, address) {
    try {
      const updateQuery = {
        text: 'UPDATE employees SET address = $1 WHERE employee_id = $2 RETURNING *',
        values: [address, employeeId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update employee address');
    }
  }

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INVENTORY STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Define Inventory model
const InventoryModel = {
  async create(item) {
    try {
      // Insert new item
      const insertQuery = {
        text: 'INSERT INTO inventory(name, description, weight, price, itemgroup, stock, image) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        values: [item.name, item.description, item.weight, item.price, item.itemgroup, item.stock, item.image],
      };
      const { rows } = await client.query(insertQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create item');
    }
  },

  // Find employee by email
  async findByID(inventory_id) {
    const query = {
      text: 'SELECT * FROM inventory WHERE inventory_id = $1',
      values: [inventory_id],
    };
    const { rows } = await client.query(query);
    return rows[0];
  },

  // display inventory
  async displayInventory() {
    // Define the SELECT query to retrieve all rows from the "inventory" table
    const query = {
      text: 'SELECT * FROM inventory',
    };
  
    // Execute 
    const { rows } = await client.query(query);
  
    // Return rows
    return rows;
  },

  // Update inventory item based on inventory_id
  async updateInventory(inventory_id, updateFields) {
    try {
      // Find the item with the given inventory ID
      const item = await InventoryModel.findByID(inventory_id);
      if (!item) {
        throw new Error('Item not found');
      }
  
      // Update the inventory fields with the new values, or keep the old value if the field is not provided
      const updateQuery = {
        text: 'UPDATE inventory SET name = $1, description = $2, weight = $3, price = $4, itemgroup = $5, stock = $6 , image = $7 WHERE inventory_id = $8 RETURNING *',
        values: [
          updateFields.name || inventory.rows[0].name,
          updateFields.description || inventory.rows[0].description,
          updateFields.weight || inventory.rows[0].weight,
          updateFields.price || inventory.rows[0].price,
          updateFields.itemgroup || inventory.rows[0].itemgroup,
          updateFields.stock || inventory.rows[0].stock,
          updateFields.image || inventory.rows[0].image,
          inventory_id,
        ],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update inventory item');
    }
  },

  // Delete item based on inventory_id
  async removeInventoryItem(inventory_id) {
    try {
      // Find the item with the given inventory ID
      const item = await InventoryModel.findByID(inventory_id);
      if (!item) {
        throw new Error('Item not found');
      }
  
      // Delete the item
      const query = {
        text: 'DELETE FROM inventory WHERE inventory_id = $1',
        values: [inventory_id],
      };
      const result = await client.query(query);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to remove inventory item');
    }
  },

  // get item name
  async getInventoryName(itemid) {
    try {
      const query = {
        text: 'SELECT name FROM inventory WHERE itemid = $1',
        values: [id],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].name;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory name');
    }
  },

  // get item description
  async getInventoryDescription(itemid) {
    try {
      const query = {
        text: 'SELECT description FROM inventory WHERE itemid = $1',
        values: [itemid],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].description;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory description');
    }
  },

  // get item weight
  async getInventoryWeight(itemid) {
    try {
      const query = {
        text: 'SELECT weight FROM inventory WHERE itemid = $1',
        values: [itemid],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].weight;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory weight');
    }
  },

  // get item price
  async getInventoryPrice(itemid) {
    try {
      const query = {
        text: 'SELECT price FROM inventory WHERE itemid = $1',
        values: [itemid],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].price;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory price');
    }
  },

  // get itemgroup
  async getInventoryItemGroup(itemid) {
    try {
      const query = {
        text: 'SELECT itemgroup FROM inventory WHERE itemid = $1',
        values: [itemid],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].itemgroup;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory item group');
    }
  },

  // get item stock
  async getInventoryStock(itemid) {
    try {
      const query = {
        text: 'SELECT stock FROM inventory WHERE itemid = $1',
        values: [itemid],
      };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
        return rows[0].stock;
      } else {
        throw new Error('Inventory item not found');
      }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get inventory stock');
    }
  },

  // update name
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

  // update name
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

  // update name
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

  // update price
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

  // update itemgroup
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

  // update stock
  async updateStock(itemId, stock) {
    try {
      const updateQuery = {
        text: 'UPDATE inventory SET stock = $1 WHERE inventory_id = $2 RETURNING *',
        values: [stock, itemId],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update stock');
    }
  },

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ORDER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Define Order model
const OrderModel = {
  async createOrder(order) {
    try {
      // Insert new order
      const insertQuery = {
        text: 'INSERT INTO orders(creationdate, status, deliverydate) VALUES($1, $2, $3) RETURNING *',
        values: [order.creationdate, order.status, order.deliverydate],
      };
      const result = await client.query(insertQuery);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create order');
    }
  },

  // Find employee by email
  async findByID(order_id) {
    const query = {
      text: 'SELECT * FROM orders WHERE order_id = $1',
      values: [order_id],
    };
    const { rows } = await client.query(query);
    return rows[0];
  },

  // display orders
  async displayOrders() {
    // Define the SELECT query to retrieve all rows from the "orders" table
    const query = {
      text: 'SELECT * FROM orders',
    };
  
    // Execute 
    const { rows } = await client.query(query);
  
    // Return rows
    return rows;
  },

  // Delete Orders using Order_id
  async removeOrder(order_id) {
    try {
      // Find the item with the given inventory ID
      const item = await OrderModel.findByID(order_id);
      if (!item) {
        throw new Error('Item not found');
      }
  
      // Delete the item
      const query = {
        text: 'DELETE FROM orders WHERE order_id = $1',
        values: [order_id],
      };
      const result = await client.query(query);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to remove order');
    }
  },

  async updateOrder(order_id, updateFields) {
    try {
      const order = await client.query('SELECT * FROM orders WHERE order_id = $1', [order_id]);
      if (order.rowCount === 0) {
        throw new Error('Order not found');
      }
  
      // Update the order fields with the new values, or keep the old value if the field is not provided
      const updateQuery = {
        text: 'UPDATE orders SET creationdate = $1, status = $2, deliverydate = $3 WHERE order_id = $4 RETURNING *',
        values: [
          updateFields.creationdate || order.rows[0].creationdate,
          updateFields.status || order.rows[0].status,
          updateFields.deliverydate || order.rows[0].deliverydate,
          order_id,
        ],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update order');
    }
  },

  // get order status
  async getOrderStatus(order_id) {
    try {
      const query = {
        text: 'SELECT status FROM orders WHERE order_id = $1',
        values: [order_id],
    };
      const { rows } = await client.query(query);
      if (rows.length > 0) {
      return rows[0].status;
    } else {
        throw new Error('Order not found');
    }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get order status');
    }
  },
    
    // get order creation date
  async getOrderCreationDate(order_id) {
    try {
      const query = {
        text: 'SELECT creationdate FROM orders WHERE order_id = $1',
        values: [order_id],
    };
    const { rows } = await client.query(query);
    if (rows.length > 0) {
    return rows[0].creationdate;
    } else {
      throw new Error('Order not found');
    }
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get order creation date');
    }
  },
    
  // get order delivery date
  async getOrderDeliveryDate(order_id) {
    try {
      const query = {
        text: 'SELECT deliverydate FROM orders WHERE order_id = $1',
        values: [order_id],
    };
    const { rows } = await client.query(query);
    if (rows.length > 0) {
    return rows[0].deliverydate;
    } else {
        throw new Error('Order not found');
    }
    } catch (err) {
        console.error(err);
        throw new Error('Failed to get order delivery date');
    }
  },

  //update order status
  async updateOrderStatus(order_id, status) {
    try {
      const updateQuery = {
        text: 'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
        values: [status, order_id],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update order status');
    }
  },

  // update order delivery date
  async updateOrderDeliveryDate(order_id, deliverydate) {
    try {
      const updateQuery = {
        text: 'UPDATE orders SET deliverydate = $1 WHERE order_id = $2 RETURNING *',
        values: [deliverydate, order_id],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update order delivery date');
    }
  },

};



// Configure middleware
app.use(cors());
app.use(bodyParser.json());

/**********************************************************************************************************
**************************************END POINTS BELOW*****************************************************
**********************************************************************************************************/

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~CUSTOMER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

    // Set session cookie
    req.session.user = { id: user.firstname, email: user.email };
    req.session.authenticated = true;

    
    // Return success response
    console.log('Login successful'+ ' this ' + req.sessionID);
    console.log(user.firstname + ' ' + user.email)
    res.status(200).json({ message: 'Login successful', user });
    
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// Endpoint for user logout
app.post('/logout', async (req, res) => {
  try {
    // Destroy session
    req.session.destroy();
    
    // Return success response
    res.status(200).json({ message: 'Logout successful' });
    
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/displayCustomers', async (req, res) => {
  try {
    // Define the SELECT query to retrieve all rows from the "customer" table
    const query = {
      text: 'SELECT * FROM customer',
    };
  
    // Execute the query using the database client
    const { rows } = await client.query(query);

    // Return the retrieved rows as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle any errors that occurred during the query or response
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update whole customer page
app.put('/updateCustomer/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const updateFields = req.body;
    const updatedCustomer = await UserModel.updateCustomer(email, updateFields);
    res.json(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update customer');
  }
});

// Endpoint to delete customer
app.delete('/removeCustomer', async (req, res) => {
  try {
    const { email } = req.query;
    await UserModel.removeCustomer(email);
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});






//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~EMPLOYEE STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

    // Set session cookie
    req.session.employee = { firstname: employee.firstname, email: employee.email };
    req.session.authenticated = true;

    // Return success response
    console.log('Employee login successful'+ ' this ' + req.sessionID);
    console.log(employee.firstname + ' ' + employee.email)
    res.status(200).json({ message: 'Login successful', employee});

  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// end point to display employees
app.get('/displayEmployees', async (req, res) => {
  try {
    // Define the SELECT query to retrieve all rows from the "employee" table
    const query = {
      text: 'SELECT * FROM employee',
    };
  
    // Execute the query using the database client
    const { rows } = await client.query(query);

    // Return the retrieved rows as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle any errors that occurred during the query or response
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update the employee page
app.put('/updateEmployee/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const updateFields = req.body;
    const updatedEmployee = await EmployeeModel.updateEmployee(email, updateFields);
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update employee');
  }
});

// Endpoint to delete an employee by email
app.delete('/removeEmployee', async (req, res) => {
  try {
    const { email } = req.query;
    await EmployeeModel.removeEmployee(email);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get employee ID by email
app.get('/getEmployeeID', async (req, res) => {
  try {
    const { email } = req.query;
    const employeeId = await getEmployeeID(email);
    res.status(200).json({ employeeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/getEmployFirstName', async (req, res) => {
  try {
    const { employee_ID } = req.query;
    const firstName = await getEmployFirstName(employee_ID);
    res.status(200).json({ firstName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get employee last name
app.get('/getEmployLastName', async (req, res) => {
  try {
    const { employee_ID } = req.query;
    const lastName = await getEmployLastName(employee_ID);
    res.status(200).json({ lastName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/getEmployAddress', async (req, res) => {
  try {
    const { employee_ID } = req.query;
    const address = await getEmployAddress(employee_ID);
    res.status(200).json({ address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an employee's first name
app.patch('/updateEmployFirstName', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const firstName = req.body.firstName;
    const updatedEmployee = await EmployeeModel.updateEmployFirstName(employeeId, firstName);
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an employee's last name
app.patch('updateEmployLastName', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const lastName = req.body.lastName;
    const updatedEmployee = await EmployeeModel.updateEmployLastName(employeeId, lastName);
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('updateEmployAddress', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const address = req.body.address;
    const updatedEmployee = await EmployeeModel.updateEmployAddress(employeeId, address);
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~INVENTORY STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Endpoint to get inventory stock
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

// endpoint to get specific item by id
app.get('/findItemById/:inventory_id', async (req, res) => {
  try {
    const inventory_id = req.params.inventory_id;
    const item = await InventoryModel.findByID(inventory_id);
    res.status(200).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// endpoint to display inventory
app.get('/displayInventory', async (req, res) => {
  try {
    // Define the SELECT query to retrieve all rows from the "inventory" table
    const query = {
      text: 'SELECT * FROM inventory',
    };
  
    // Execute the query using the database client
    const { rows } = await client.query(query);

    // Return the retrieved rows as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle any errors that occurred during the query or response
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for Update inventory item based on inventroy ID
app.put('/updateInventory/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateFields = req.body;
    const updatedItem = await InventoryModel.updateInventory(id, updateFields);
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update item');
  }
});

// Endpoint to delete inventory item
app.delete('/removeInventoryItem', async (req, res) => {
  try {
    const { inventory_id } = req.query;
    await InventoryModel.removeInventoryItem(inventory_id);
    res.status(200).json({ message: `Inventory item with ID ${inventory_id} has been deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the name of an inventory item by itemid
app.get('/getInventoryName', async (req, res) => {
  try {
    const { itemid } = req.params;
    const name = await getInventoryName(itemid);
    res.status(200).json({ name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the weight of an inventory description
app.get('/getInventoryDescription', async (req, res) => {
  try {
    const { itemid } = req.query;
    const description = await getInventoryDescription(itemid);
    res.status(200).json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the weight of an inventory item
app.get('/getInventoryWeight', async (req, res) => {
  try {
    const { itemid } = req.query;
    const weight = await getInventoryWeight(itemid);
    res.status(200).json({ weight });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the price of an item in inventory
app.get('/getInventoryPrice', async (req, res) => {
  try {
    const { itemid } = req.query;
    const price = await getInventoryPrice(itemid);
    res.status(200).json({ price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get inventory itemgroup
app.get('/getInventoryItemGroup', async (req, res) => {
  try {
    const { itemid } = req.query;
    const itemGroup = await getInventoryItemGroup(itemid);
    res.status(200).json({ itemGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get inventory stock
app.get('/getInventoryStock', async (req, res) => {
  try {
    const { itemid } = req.query;
    const stock = await getInventoryStock(itemid);
    res.status(200).json({ stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an inventory item's name
app.patch('updateName', async (req, res) => {
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
app.patch('updateDescription', async (req, res) => {
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
app.patch('updateWeight', async (req, res) => {
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
app.patch('updatePrice', async (req, res) => {
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
app.patch('updateItemGroup', async (req, res) => {
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ORDER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/createOrder', async (req, res) => {
  try {
    const order = req.body;
    const newOrder = await OrderModel.createOrder(order);
    res.status(201).json({ newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to display orders
app.get('/displayOrders', async (req, res) => {
  try {
    // Define the SELECT query to retrieve all rows from the "orders" table
    const query = {
      text: 'SELECT * FROM orders',
    };
  
    // Execute the query using the database client
    const { rows } = await client.query(query);

    // Return the retrieved rows as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle any errors that occurred during the query or response
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//update order
app.put('/updateOrder/:order_id', async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const updateFields = req.body;
    const updatedOrder = await OrderModel.updateOrder(order_id, updateFields);
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update order');
  }
});

//Delete an order basd on order id
app.delete('/removeOrder', async (req, res) => {
  try {
    const { order_id } = req.query;
    await OrderModel.removeOrder(order_id);
    res.status(200).json({ message: `Order with ID ${order_id} has been deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// get order status
app.get('/getOrderStatus', async (req, res) => {
  try {
    const { order_id } = req.query;
    const status = await getOrderStatus(order_id);
    res.status(200).json({ status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/getOrderCreationDate', async (req, res) => {
  try {
    const { order_id } = req.query;
    const creationDate = await OrderModel.getOrderCreationDate(order_id);
    res.status(200).json({ creationDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get order delivery date
app.get('/getOrderDeliveryDate', async (req, res) => {
  try {
    const { order_id } = req.params;
    const deliveryDate = await OrderModel.getOrderDeliveryDate(order_id);
    res.status(200).json({ deliveryDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an order's status
app.patch('updateOrderStatus', async (req, res) => {
  try {
    const orderId = req.params.order_id;
    const status = req.body.status;
    const updatedOrder = await OrderModel.updateOrderStatus(orderId, status);
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an order's delivery date
app.patch('/updateOrderDeliveryDate', async (req, res) => {
  try {
    const orderId = req.params.order_id;
    const deliveryDate = req.body.deliveryDate;
    const updatedOrder = await OrderModel.updateOrderDeliveryDate(orderId, deliveryDate);
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req,res) => res.json('My api running. '))
