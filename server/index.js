const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);

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

app.enable('trust proxy');

// Session middleware
const sessionConfig = {
  secret: 'some secret', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000, // Session duration in milliseconds (30 days in this case)
  },
  store: new pgSession({
    pool: client, // Postgres client instance
    tableName: 'session' // Table name to store sessions
  })
};

// Configure middleware
app.use(cors());
app.use(cookieParser());
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
        text: `INSERT INTO customer (firstname, lastname, email, password, shippingaddress, 
                creditcard, cvv, expirationdate, billingaddress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        values: [
          user.firstname,
          user.lastname,
          user.email,
          hashedPassword,
          user.shippingaddress,
          user.creditcard,
          user.cvv,
          user.expirationdate,
          user.billingaddress,
        ],
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
        text: `UPDATE customer SET firstname = $1, lastname = $2, email = $3, password = $4, shippingaddress = $5, creditcard = $6, cvv = $7, 
          expirationdate = $8, billingaddress = $9 WHERE email = $10 RETURNING *`,
        values: [
          updateFields.firstname || customer.rows[0].firstname,
          updateFields.lastname || customer.rows[0].lastname,
          updateFields.email || customer.rows[0].email,
          updateFields.password ? await bcrypt.hash(updateFields.password, 10) : customer.rows[0].password,
          updateFields.shippingaddress || customer.rows[0].shippingaddress,
          updateFields.creditcard || customer.rows[0].creditcard,
          updateFields.cvv || customer.rows[0].cvv,
          updateFields.expirationdate || customer.rows[0].expirationdate,
          updateFields.billingaddress || customer.rows[0].billingaddress,
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

  async getCustID(email) {
    const query = {
      text: 'SELECT customer_id FROM customer WHERE email = $1',
      values: [email],
    };
    const { rows } = await client.query(query);
    return rows[0].customer_id;
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
  }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INVENTORY STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Define Inventory model
const InventoryModel = {
  async create(item) {
    try {
      // Insert new item
      const insertQuery = {
        text: 'INSERT INTO inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        values: [item.name, item.description, item.weight, item.price, item.itemgroup, item.stock, item.image, item.warehouse],
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
        text: 'UPDATE inventory SET name = $1, description = $2, weight = $3, price = $4, itemgroup = $5, stock = $6 , image = $7, warehouse = $8 WHERE inventory_id = $9 RETURNING *',
        values: [
          updateFields.name || inventory.rows[0].name,
          updateFields.description || inventory.rows[0].description,
          updateFields.weight || inventory.rows[0].weight,
          updateFields.price || inventory.rows[0].price,
          updateFields.itemgroup || inventory.rows[0].itemgroup,
          updateFields.stock || inventory.rows[0].stock,
          updateFields.image || inventory.rows[0].image,
          updateFields.warehouse || inventory.rows[0].warehouse,
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

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Shopping Cart STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const ShoppingCartModel = {

  // Find shopping cart by customer ID
  async findSCByCustID(customer_id) {
    const query = {
      text: 'SELECT * FROM shopping_cart WHERE customer_id = $1',
      values: [customer_id],
    };
    const { rows } = await client.query(query);
    return rows[0];
  },

  // Create a shopping cart whenever the customer logs in
  async createShoppingCart(customer_id) {
    try {
      // Check if a shopping cart already exists for the customer
      const shoppingCart = await ShoppingCartModel.findSCByCustID(customer_id);

      if (shoppingCart) {
        // Shopping cart already exists, return it
        return shoppingCart;
      }

      // Shopping cart does not exist, create a new one
      const insertQuery = {
        text: 'INSERT INTO shopping_cart(customer_id) VALUES($1) RETURNING *',
        values: [customer_id],
      };
      const { rows: newRows } = await client.query(insertQuery);
      return newRows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create shopping cart');
    }
  },

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Shopping Cart Item STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const ShoppingCartItemModel = {

  // Find shopping cart by customer ID
  async findSCByCustID(customer_id) {
    const query = {
      text: 'SELECT * FROM shopping_cart WHERE customer_id = $1',
      values: [customer_id],
    };
    const { rows } = await client.query(query);
    return rows[0];
  },

  // Get shopping cart items cart_id
  async getCartID(customer_id) {
    try {
      const query = {
        text: 'SELECT id FROM shopping_cart WHERE customer_id = $1',
        values: [customer_id]
      };
      const { rows } = await client.query(query);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get shopping cart id');
    }
  },

  // Get all shopping cart items by cart_id
  async getItemsByCartId(cart_id) {
    try {
      const query = {
        text: `SELECT sci.quantity, sci.totalprice, i.*
          FROM shopping_cart_items sci
          JOIN inventory i ON sci.inventory_id = i.inventory_id
          WHERE cart_id = $1;`,
        values: [cart_id]
      };
      const { rows } = await client.query(query);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get shopping cart items');
    }
  },

  // Find shopping cart items by cart_id and inventory_id
  async findItemByCartAndItemId(cart_id, inventory_id) {
    try {
      const query = {
        text: 'SELECT * FROM shopping_cart_items WHERE cart_id = $1 AND inventory_id = $2',
        values: [cart_id, inventory_id]
      };
      const { rows } = await client.query(query);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to find shopping cart item');
    }
  },

  async addItemToCart(customer_id, inventory_id, quantity) {
    try {
      // Item does not exist, retrieve the price from the inventory table and create a new item
      const itemCheck = await InventoryModel.findByID(inventory_id);
      if (!itemCheck) {
        throw new Error('Inventory item not found');
      }

      const shoppingCart = await ShoppingCartModel.findSCByCustID(customer_id);
      if (!shoppingCart) {
        throw new Error('Shopping cart not found');
      }
  
      console.log("Shopping cart found");
  
      // Check if the item already exists in the shopping cart
      const existingItem = await ShoppingCartItemModel.findItemByCartAndItemId(shoppingCart.id, inventory_id);
      if (existingItem) {
        // Item already exists, update the quantity
        const newQuantity = existingItem.quantity + quantity;
        await ShoppingCartItemModel.updateCartItemQuantity(newQuantity, shoppingCart.id, existingItem.inventory_id);
        return { message: 'Item quantity updated in cart' };
      } else {
        // Item does not exist, retrieve the price from the inventory table and create a new item
        const inventoryItem = await InventoryModel.findByID(inventory_id);
        if (!inventoryItem) {
          return { error: 'Inventory item not found' };
        }
        const price = inventoryItem.price;
        const insertQuery = {
          text: 'INSERT INTO shopping_cart_items (cart_id, inventory_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
          values: [shoppingCart.id, inventory_id, quantity, price],
        };
        const { rows: newRows } = await client.query(insertQuery);
        return newRows[0];
      }
  
    } catch (err) {
      console.error(err);
      throw new Error('Failed to add item to cart');
    }
  },

  // remove a cart item
  async removeCartItem(cart_id, inventory_id) {
    try {
      // Find the item with the given cart_id and inventory_id
      const item = await ShoppingCartItemModel.findItemByCartAndItemId(cart_id, inventory_id);
      if (!item) {
        throw new Error('Item not found');
      }
  
      // Delete the item
      const query = {
        text: 'DELETE FROM shopping_cart_items WHERE cart_id = $1 AND inventory_id = $2',
        values: [cart_id, inventory_id],
      };
      const result = await client.query(query);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to remove item');
    }
  },

  async updateCartItemQuantity(cart_id, inventory_id, quantity) {
    try {
      // Find the item with the given cart_id and inventory_id
      const item = await ShoppingCartItemModel.findItemByCartAndItemId(cart_id, inventory_id);
      if (!item) {
        throw new Error('Item not found');
      }

      const updateQuery = {
        text: 'UPDATE shopping_cart_items SET quantity = $1 WHERE cart_id = $2 AND inventory_id = $3 RETURNING *',
        values: [quantity, cart_id, inventory_id],
      };
      const { rows } = await client.query(updateQuery);
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to update item quantity');
    }
  }

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ORDER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Define Order model
const OrderModel = {
  async checkout(customer_id, cart_id, shipping_method) {
    try {
      // Insert new order
      const insertOrderQuery = {
        text: 'INSERT INTO orders(customer_id, creationdate, status, deliverydate, shipping_method) VALUES($1, NOW(), $2, NULL, $3) RETURNING *',
        values: [customer_id, 'pending', shipping_method],
      };
      const newOrder = await client.query(insertOrderQuery);

      console.log("order created");
  
      // Move items from shopping cart to order_items table
      const insertOrderItemsQuery = {
        text: `INSERT INTO order_items(order_id, inventory_id, quantity, price, total_price)
               SELECT $1, sci.inventory_id, sci.quantity, sci.price, sci.totalprice
               FROM shopping_cart_items sci
               WHERE sci.cart_id = $2`,
        values: [newOrder.rows[0].order_id, cart_id],
      };
      await client.query(insertOrderItemsQuery);
  
      // Clear shopping cart
      const deleteShoppingCartItemsQuery = {
        text: 'DELETE FROM shopping_cart_items WHERE cart_id = $1',
        values: [cart_id],
      };
      await client.query(deleteShoppingCartItemsQuery);
  
      // Return the new order
      return newOrder.rows[0];
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create order');
    }
  },


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

  // display all of a specific customers orders
  async getOrdersByCustomerId(customer_id) {
    try {
      const query = {
        text: 'SELECT * FROM orders WHERE customer_id = $1',
        values: [customer_id],
      };
      const { rows } = await client.query(query);
      return rows;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get orders');
    }
  },

  // display the items from an order
  async getOrderItemsByOrderId(order_id) {
    try {
      const query = {
        text: 'SELECT * FROM order_items WHERE order_id = $1',
        values: [order_id],
      };
      const { rows } = await client.query(query);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get order items');
    }
  },

  // Get orders and order_items by customer id
  async getOrdersAndItemsByCustomerId(customer_id) {
    try {
      const query = {
        text: `SELECT 
        o.order_id, 
        o.creationdate, 
        o.status, 
        o.deliverydate,
        o.shipping_method,
        oi.inventory_id, 
        oi.quantity, 
        oi.price, 
        oi.total_price,
        i.name
        FROM 
          orders o
          JOIN order_items oi ON o.order_id = oi.order_id
          JOIN inventory i ON oi.inventory_id = i.inventory_id
        WHERE 
          o.customer_id = $1;`,
        values: [customer_id],
      };
      const { rows } = await client.query(query);
      return rows;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get orders');
    }
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
        text: 'UPDATE orders SET creationdate = $1, status = $2, deliverydate = $3, shipping_method = $4 WHERE order_id = $5 RETURNING *',
        values: [
          updateFields.creationdate || order.rows[0].creationdate,
          updateFields.status || order.rows[0].status,
          updateFields.deliverydate || order.rows[0].deliverydate,
          updateFields.shipping_method || order.rows[0].shipping_method,
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

};

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
    const { firstname, lastname, email, password, shippingaddress, creditcard, cvv, expirationdate, billingaddress } = req.body;

    // Validate user data
    if (!firstname || !lastname || !email || !password || !shippingaddress || !creditcard || !cvv || !expirationdate || !billingaddress) {
      throw new Error('Invalid user data');
    }

    // Create new user
    const user = { firstname, lastname, email, password, shippingaddress, creditcard, cvv, expirationdate, billingaddress };
    await UserModel.create(user);

    const customer_id = await UserModel.getCustID(user.email);
    if (!user) {
      throw new Error('Could not find user.');
    }

    // Set session cookie
    req.session.user = { customer_id: customer_id, email: user.email };
    req.session.authenticated = true;

    // Create a shopping cart for the customer
    const shoppingCart = await ShoppingCartModel.createShoppingCart(customer_id);
    
    // Return success response
    console.log('Registration successful '+ customer_id + " " + user.email);
    res.status(200).json({ message: 'User created successfully', customer_id: customer_id, email: user.email, shopping_cart: shoppingCart});
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
    req.session.user = { customer_id: user.customer_id, email: user.email };
    req.session.authenticated = true;

    // Create a shopping cart for the customer
    const shoppingCart = await ShoppingCartModel.createShoppingCart(user.customer_id);
    
    // Return success response
    console.log('Login successful'+ ' this ' + req.sessionID);
    console.log(user.customer_id + ' ' + user.email)
    res.status(200).json({ message: 'Login successful', user, shoppingCart });
    
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

    // Set session cookie
    req.session.employee = { firstname: employee.firstname, email: employee.email };
    req.session.authenticated = true;

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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SHOPPING CART ITEMS STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Get shopping cart items cart_id
app.get('/getCartID/:customer_id', async (req, res) => {
  const { cart_id } = req.params;

  try {
    const items = await ShoppingCartItemModel.getCartID(customer_id);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get shopping cart id');
  }
});

// endpoint that returns all shopping cart items for a given cart_id
app.get('/getItemsByCartId/:cart_id', async (req, res) => {
  const { cart_id } = req.params;

  try {
    const items = await ShoppingCartItemModel.getItemsByCartId(cart_id);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get shopping cart items');
  }
});

// endpoint for adding an item to the shopping cart
app.post('/addItemToCart', async (req, res) => {
  const { customer_id, inventory_id, quantity } = req.body;

  // FOR COOKIES
  // const { inventory_id, quantity } = req.body;
  // const customer_id = req.session.user.customer_id; // Get the customer_id from the session
  // console.log(customer_id)

  try {
    const newItem = await ShoppingCartItemModel.addItemToCart(customer_id, inventory_id, quantity);
    res.status(200).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.delete('/removeCartItem', async (req, res) => {
  try {

    const { customer_id, inventory_id } = req.query;

    // FOR COOKIES
    // const { inventory_id } = req.query;
    // const customer_id = req.session.user.customer_id; // Get the customer_id from the session

    const { rows } = await client.query('SELECT id as cart_id FROM shopping_cart WHERE customer_id = $1', [customer_id]);
    const cart_id = rows[0].cart_id;

    await ShoppingCartItemModel.removeCartItem(cart_id, inventory_id);
    res.status(200).json({ message: `Item with inventory ID ${inventory_id} has been removed from cart ${cart_id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update the quantity of a cart item
app.put('/updateCartItemQuantity', async (req, res) => {
  try {

    const { customer_id, inventory_id, newQuantity } = req.body;

    // FOR COOKIES
    // const { inventory_id, newQuantity } = req.body;
    // const customer_id = req.session.user.customer_id; // Get the customer_id from the session

    const { rows } = await client.query('SELECT id as cart_id FROM shopping_cart WHERE customer_id = $1', [customer_id]);
    const cart_id = rows[0].cart_id;

    console.log("got id")

    const updatedItem = await ShoppingCartItemModel.updateCartItemQuantity(cart_id, inventory_id, newQuantity);
    res.status(200).json({ message: `Quantity of item with inventory ID ${inventory_id} in cart ${cart_id} has been updated to ${newQuantity}`, item: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ORDER STUFF~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/checkout', async (req, res) => {
  try {

    const { customer_id, shipping_method } = req.body;

    // FOR COOKIES
    // const customer_id = req.session.user.customer_id; // Get the customer_id from the session

    const { rows } = await client.query('SELECT id as cart_id FROM shopping_cart WHERE customer_id = $1', [customer_id]);
    const cart_id = rows[0].cart_id;

    const newOrder = await OrderModel.checkout(customer_id, cart_id, shipping_method);

    res.json({ success: true, message: 'Order created successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

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

// Display all of a specific customer's orders
app.get('/getOrdersByCustomerId/:customer_id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const orders = await OrderModel.getOrdersByCustomerId(customer_id);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to get orders');
  }
});

// Display the items from an order
app.get('/getOrderItemsByOrderId/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const orderItems = await OrderModel.getOrderItemsByOrderId(order_id);
    res.json(orderItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to get order items');
  }
});

// Display the items from an order
app.get('/getOrdersAndItemsByCustomerId/:customer_id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const orderItems = await OrderModel.getOrdersAndItemsByCustomerId(customer_id);
    res.json(orderItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to get order items');
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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req,res) => res.json('My api running. '))
