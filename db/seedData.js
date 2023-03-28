const client = require("./client");

const {createCategories} = require('/')

async function dropTables() {
  console.log("Dropping All Tables...");
  // drop all tables, in the correct order
  try {
    console.log("Starting to drop tables...");

    const client = await pool.connect();

    await client.query(`
      DROP TABLE IF EXISTS discounts;
      DROP TABLE IF EXISTS order_payment;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS cart_items;
      DROP TABLE IF EXISTS cart;
      DROP TABLE IF EXISTS user_payment;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS product_category;
        `);

    console.log("Finished dropping tables!");
    await client.release();
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  console.log("Starting to build tables...");
  // create all tables, in the correct order
  try {
    console.log("Starting to build tables...");
    const client = await pool.connect();
    await client.query(`
        CREATE TABLE product_category (
        id SERIAL PRIMARY KEY,
        name  varchar(255) UNIQUE NOT NULL
          );
        `);

    await client.query(`
        CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        is_active boolean DEFAULT TRUE,
        is_admin boolean DEFAULT FALSE,
        email VARCHAR(255) UNIQUE NOT NULL,
        address_line_one VARCHAR(255) NOT NULL,
        address_line_two VARCHAR(255),
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255),
        country VARCHAR(255) NOT NULL,
        postal_code INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL
          );
        `);

    await client.query(`
        CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES product_category(id),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL NOT NULL,
        quantity INTEGER NOT NULL,
        img BYTEA NOT NULL,
        active BOOLEAN DEFAULT TRUE
        );
      `);

    await client.query(`
        CREATE TABLE user_payment (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        payment_type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        account_no INTEGER NOT NULL,
        expire DATE NOT NULL
      );
    `);
    await client.query(`
        CREATE TABLE cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id)
    );
  `);
    await client.query(`
        CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES cart(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL
  );
`);

    await client.query(`
        CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total DECIMAL NOT NULL,
        created_at TIMESTAMP NOT NULL
);
`);
    await client.query(`
        CREATE TABLE order_payment (
        id SERIAL PRIMARY KEY,
        order_id INTEGER UNIQUE REFERENCES orders(id),
        provider VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL
);
`);
    await client.query(`
        CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER UNIQUE REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL
);
`);
    await client.query(`
        CREATE TABLE discounts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER UNIQUE REFERENCES products(id),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount_percent DECIMAL NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP,
        modified_at TIMESTAMP,
        deleted_at TIMESTAMP
);
`);

    console.log("Finished building tables!");
    await client.release();
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}


async function createCategories() {
  console.log("Pulling categories...")
  try {
    const categoriesToCreate = [
      {Appliances},
      {Auto},
      {Books},
      {Clothing},
      {Electronics},
      {Gaming},
      {Jewlery},
      {Lifestyle},
      {Muic},
      {Pets},
      {Sports},
      {Tools}

    ]
    const categories = await Promise.all(categoriesToCreate.map(createCategories))
    console.log(categories)

  } catch (error) {
    console.log("Error creating categories")
  }
}

async function createInitialUsers() {}
async function createCategories() {}
async function createInitialProducts() {}
async function createInitialDiscounts() {}
async function createInitialCarts() {}
async function createInitialPayments() {}
async function createInitialOrderHistory() {}
