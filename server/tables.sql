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
    expirationDate VARCHAR(255),
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
    customer_id INTEGER REFERENCES customer(customer_id)
)

INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');
INSERT INTO Orders(creationdate, status, deliverydate)
VALUES('2023-01-01', 'processing', '2023-12-31');

DROP TABLE IF EXISTS shopping_cart;
CREATE TABLE shopping_cart (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer(customer_id),
  created_at TIMESTAMP DEFAULT NOW(),
  modified_at TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS shopping_cart_items;
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

DROP TABLE IF EXISTS order_items;
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


-- CHAIR DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('High-Back Leather Executive Chair', 'Luxurious leather chair with high backrest, padded armrests, and adjustable height. Black.', 60, 299.99, 'chair', 200, 'Chair', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Mid-Back Mesh Task Chair', 'Ergonomic mesh chair with lumbar support, adjustable height, and swivel base. Black.', 35, 149.99, 'chair', 500, 'Chair', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Modern Accent Chair', 'Sleek and stylish chair with curved backrest and tapered legs. Upholstered in gray fabric.', 25, 199.99, 'chair', 100, 'Chair', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Stacking Plastic Chair', 'Lightweight and durable chair made of molded plastic. Stackable for easy storage. Available in various colors.', 10, 19.99, 'chair', 1000, 'Chair', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Big & Tall Leather Executive Chair', 'Extra-large leather chair with high backrest and wide seat. Supports up to 400 lbs. Black.', 85, 399.99, 'chair', 50, 'Chair', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Drafting Stool', 'Adjustable height stool with footrest and cushioned seat. Ideal for drafting tables and standing desks. Black.', 20, 99.99, 'chair', 150, 'Chair', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Gaming Chair', 'Ergonomic racing-style chair with high backrest, lumbar support, and adjustable armrests. Available in various colors.', 50, 249.99, 'chair', 100, 'Chair', 'Warehouse 1');


-- TABLE DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('L-Shaped Corner Desk', 'Large corner desk with ample workspace and multiple storage options. Available in various finishes.', 150, 599.99, 'table', 50, 'Tables', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Round Conference Table', 'Circular table with wood veneer top and sturdy steel base. Seats 4-6 people. Cherry finish.', 120, 799.99, 'table', 20, 'Tables', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Folding Utility Table', 'Lightweight table with plastic top and steel frame. Folds in half for easy transport and storage. White.', 30, 99.99, 'table', 100, 'Tables', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Rectangular Training Table', 'Long table with laminate top and steel legs. Ideal for training rooms and classrooms. Available in various sizes.', 70, 299.99, 'table', 50, 'Tables', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Height-Adjustable Folding Table', 'Portable table with adjustable height and durable resin top. Folds in half for easy transport and storage. Gray.', 40, 149.99, 'table', 150, 'Tables', 'Warehouse 2');

-- WRITING DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Fine Point Rollerball Pens', 'Set of 12 fine point rollerball pens in black ink. Smooth writing experience and comfortable grip.', 0.4, 12.99, 'writing', 500, 'Writing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Mechanical Pencils', 'Pack of 24 mechanical pencils with eraser and refillable lead. 0.7 mm point size. Ideal for standardized tests and sketching.', 0.3, 19.99, 'writing', 200, 'Writing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Dry Erase Markers', 'Set of 8 dry erase markers in assorted colors. Low-odor and non-toxic. Perfect for whiteboards and glass surfaces.', 0.6, 8.99, 'writing', 300, 'Writing', 'Warehouse 1');

-- PAPER-NOTEBOOK DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Spiral Bound Notebooks', 'Set of 5 spiral bound notebooks with 80 sheets each. Wide ruled paper. Ideal for school and office use.', 1.5, 14.99, 'paper-notebooks', 300, 'Paper-Notebooks', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Softcover Journal', 'Elegant softcover journal with 192 lined pages and ribbon bookmark. Available in various colors.', 0.6, 9.99, 'paper-notebooks', 200, 'Paper-Notebooks', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Sketchbook', 'Hardcover sketchbook with 100 blank pages. Ideal for drawing and painting with various media.', 0.9, 19.99, 'paper-notebooks', 100, 'Paper-Notebooks', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Composition Notebooks', 'Pack of 6 composition notebooks with 100 sheets each. College ruled paper. Sturdy covers in assorted colors.', 2.1, 24.99, 'paper-notebooks', 150, 'Paper-Notebooks', 'Warehouse 1');

-- BACKPACKS DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Hiking Backpack', 'Large capacity backpack with multiple compartments and pockets. Suitable for hiking and camping. Water-resistant. Black.', 2.5, 79.99, 'backpack', 100, 'Backpacks', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Canvas Backpack', 'Casual backpack made of high-quality canvas with leather accents. Spacious main compartment and front pocket. Available in various colors.', 1.1, 39.99, 'backpack', 200, 'Backpacks', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Rolling Backpack', 'Versatile backpack with wheels and telescoping handle for easy transport. Padded laptop compartment and several pockets. Black.', 2.9, 99.99, 'backpack', 50, 'Backpacks', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Tactical Backpack', 'Durable and rugged backpack with molle system and multiple compartments. Ideal for military and outdoor activities. Available in various colors.', 2.4, 69.99, 'backpack', 75, 'Backpacks', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Convertible Backpack', 'Convertible backpack that can be used as a shoulder bag or a tote. Made of high-quality materials and available in various colors. Ideal for commuting or traveling.', 1.5, 89.99, 'backpack', 150, 'Backpacks', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Hydration Backpack', 'Backpack with built-in hydration system and multiple pockets for storage. Suitable for hiking, running, and other outdoor activities. Available in various colors.', 1.3, 59.99, 'backpack', 100, 'Backpacks', 'Warehouse 2');

-- PRINTING DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Color Laser Printer', 'Color laser printer with automatic duplex printing and mobile printing capability. Prints up to 18 ppm in color and black and white. Compact design for small workspaces. Black.', 21, 279.99, 'printing', 50, 'Printing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Photo Printer', 'Compact photo printer that produces high-quality prints in various sizes up to 4 x 6 inches. Wireless printing capability and mobile app for easy printing from your smartphone or tablet. Black.', 2.1, 99.99, 'printing', 200, 'Printing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Portable Label Printer', 'Portable label printer with Bluetooth connectivity and built-in rechargeable battery. Prints high-quality labels up to 2.4 inches wide. Ideal for labeling files, folders, and other items. Black.', 0.6, 59.99, 'printing', 50, 'Printing', 'Warehouse 2');

-- ORGANIZING DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Stackable Letter Trays', 'Set of 2 stackable letter trays for organizing papers and documents. Black.', 3, 14.99, 'organizing', 300, 'Organizing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Desk Drawer Organizer', 'Bamboo desk drawer organizer with 5 compartments for storing pens, paper clips, and other small items.', 1.5, 22.99, 'organizing', 150, 'Organizing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Wall-Mounted File Holder', 'Sturdy wall-mounted file holder with 3 compartments for storing files and documents. Black.', 4, 29.99, 'organizing', 100, 'Organizing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Drawer Dividers', 'Set of 4 adjustable drawer dividers for organizing socks, underwear, and other small items. White.', 0.5, 8.99, 'organizing', 500, 'Organizing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Hanging Wall Organizer', 'Hanging wall organizer with 4 pockets for storing files, folders, and other documents. Gray.', 0.8, 12.99, 'organizing', 200, 'Organizing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Collapsible File Box', 'Collapsible file box with handles for easy transport and storage. Holds letter and legal size files. Black.', 3.5, 24.99, 'organizing', 100, 'Organizing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Desktop Organizer with Drawers', 'Wooden desktop organizer with 6 compartments and 2 drawers for storing pens, paper clips, and other small items. Brown.', 4, 39.99, 'organizing', 150, 'Organizing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Cable Management Sleeves', 'Set of 2 cable management sleeves for organizing computer and TV cables. Black.', 0.2, 7.99, 'organizing', 500, 'Organizing', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Underbed Storage Box', 'Underbed storage box with clear lid for easy viewing and handles for easy transport. Holds up to 12 pairs of shoes. Clear.', 2, 19.99, 'organizing', 100, 'Organizing', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Drawer Organizers for Makeup', 'Set of 6 drawer organizers for organizing makeup and other beauty products. Clear.', 1, 14.99, 'organizing', 300, 'Organizing', 'Warehouse 1');

-- SHIPPING DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Shipping Boxes', 'Pack of 10 corrugated cardboard boxes for shipping items. Easy to assemble. 12x9x6 inches.', 2.2, 18.99, 'shipping', 300, 'Shipping', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Poly Mailers', 'Pack of 50 lightweight poly mailers for shipping and mailing items. Self-sealing. 6x9 inches.', 0.8, 8.99, 'shipping', 1000, 'Shipping', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Bubble Wrap Roll', 'Large roll of 12-inch-wide bubble wrap for protecting items during shipping. 150 feet long.', 5.0, 24.99, 'shipping', 200, 'Shipping', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Packing Tape', 'Pack of 6 clear packing tape rolls for sealing boxes and packages. Each roll is 2 inches wide and 50 yards long.', 1.8, 14.99, 'shipping', 500, 'Shipping', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Shipping Labels', 'Pack of 100 self-adhesive shipping labels with blank space for writing recipient and return addresses. 2x4 inches.', 0.3, 6.99, 'shipping', 1000, 'Shipping', 'Warehouse 2');

-- BREAKROOM DATA --
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Plastic Cups', 'Pack of 50 clear plastic cups for cold beverages. 16 oz.', 1, 4.99, 'breakroom', 500, 'Breakroom', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Paper Napkins', 'Pack of 200 white paper napkins. 2-ply.', 0.8, 6.99, 'breakroom', 1000, 'Breakroom', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Plastic Cutlery Set', 'Box of 100 clear plastic cutlery sets (fork, knife, spoon).', 2.5, 14.99, 'breakroom', 500, 'Breakroom', 'Warehouse 2');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Tea Bags', 'Box of 50 tea bags in assorted flavors. Includes black tea, green tea, and herbal tea.', 0.3, 7.99, 'breakroom', 500, 'Breakroom', 'Warehouse 1');
INSERT INTO Inventory(name, description, weight, price, itemgroup, stock, image, warehouse) VALUES('Microwave Popcorn', 'Box of 12 bags of microwave popcorn. Butter flavor.', 2, 9.99, 'breakroom', 200, 'Breakroom', 'Warehouse 2');

