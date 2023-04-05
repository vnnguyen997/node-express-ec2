DROP TABLE IF EXISTS Customer;
CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    shippingAddress VARCHAR(255) NOT NULL,
    creditCard VARCHAR(255)
)

INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('john', 'cena', 'password', 'cena@email.com', 'wwe', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('rocky', 'balboa', 'password', 'rocky@email.com', 'philly', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('lionel', 'messi', 'password', 'messi@email.com', 'argentina', '12345');
INSERT INTO Customer(firstName, lastName, password, email, shippingAddress, creditCard)
VALUES('cristiano', 'ronaldo', 'password', 'ronaldo@email.com', 'portugal', '12345');

DROP TABLE IF EXISTS Employee;
CREATE TABLE Employee (
    employee_id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)

INSERT INTO Employee(firstName, lastName, email, password)
VALUES('mark', 'zuckerberg', 'mark@email.com', 'password');
INSERT INTO Employee(firstName, lastName, email, password)
VALUES('peter', 'parker', 'parker@email.com', 'password');
INSERT INTO Employee(firstName, lastName, email, password)
VALUES('bruce', 'wayne', 'wayne@email.com', 'password');

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
    deliverydate VARCHAR(255)
)

INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');