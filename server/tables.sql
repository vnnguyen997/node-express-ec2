DROP TABLE IF EXISTS Customer;
CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    shippingAddress VARCHAR(255) NOT NULL,
    creditCard VARCHAR(255),
    cvv INTEGER,
    exiprationDate VARCHAR(255),
    billingAddress VARCHAR(255)
)

INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('john', 'cena', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.', 'cena@email.com', 'wwe', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('rocky', 'balboa', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.', 'rocky@email.com', 'philly', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('lionel', 'messi', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.', 'messi@email.com', 'argentina', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('cristiano', 'ronaldo', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.', 'ronaldo@email.com', 'portugal', '12345');

DROP TABLE IF EXISTS Employee;
CREATE TABLE Employee (
    employee_id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)

INSERT INTO Employee(firstName, lastName, email, password)
VALUES('mark', 'zuckerberg', 'mark@email.com', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.');
INSERT INTO Employee(firstName, lastName, email, password)
VALUES('peter', 'parker', 'parker@email.com', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.');
INSERT INTO Employee(firstName, lastName, email, password)
VALUES('bruce', 'wayne', 'wayne@email.com', '$2b$10$lV8OeV3zpM0KEBXAgR51heXSlYk1iigPhCgVARhxrnx4mYslcU3q.');

DROP TABLE IF EXISTS Inventory;
CREATE TABLE Inventory
(
    inventory_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    itemgroup VARCHAR(255),
    stock INT,
    image VARCHAR(255)
)

INSERT INTO Inventory(name, description, weight, price, itemgroup, stock)
VALUES('chair1', 'low comfort', 5, 10, 'chair', 10);
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock)
VALUES('chair2', 'med comfort', 10, 15, 'chair', 10);
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock)
VALUES('chair3', 'high comfort', 15, 20, 'chair', 10);
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock)
VALUES('game chair', 'for gamers only', 100, 10000, 'chair', 10);

DROP TABLE IF EXISTS Orders;
CREATE TABLE Orders
(
    order_id SERIAL PRIMARY KEY,
    creationdate VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    deliverydate VARCHAR(255),
    customer_id INTEGER REFERENCES customer(customer_id);
)

INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');

CREATE TABLE shopping_cart (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer(customer_id),
  created_at TIMESTAMP DEFAULT NOW(),
  modified_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shopping_cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES shopping_cart(id),
  inventory_id INTEGER NOT NULL REFERENCES inventory(inventory_id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  modified_at TIMESTAMP DEFAULT NOW()
);

-- Add the totalPrice column to the shopping_cart_items table
ALTER TABLE shopping_cart_items ADD COLUMN totalPrice NUMERIC(10, 2);

-- Update the totalPrice column for each row in the table
UPDATE shopping_cart_items
SET totalPrice = quantity * price;

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  inventory_id INT NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);

CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

CREATE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX session_expire_index ON session (expire);

CREATE TRIGGER update_shopping_cart_modified_at
BEFORE UPDATE ON shopping_cart
FOR EACH ROW
EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_shopping_cart_items_modified
BEFORE UPDATE ON shopping_cart_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_at_column();

CREATE OR REPLACE FUNCTION update_total_price_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.totalPrice = NEW.quantity * NEW.price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopping_cart_items_total_price
BEFORE INSERT OR UPDATE ON shopping_cart_items
FOR EACH ROW
EXECUTE FUNCTION update_total_price_column();