const client = require("./client");
const { createUser } = require("./users");


async function dropTables() {
  console.log("Dropping All Tables...");
  // drop all tables, in the correct order
  try {
    console.log("Starting to drop tables...");


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
    await client.query(`
        CREATE TABLE product_category (
        id SERIAL PRIMARY KEY,
        name  varchar(255) UNIQUE NOT NULL
          );
        `);

    await client.query(`
        CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        isActive boolean DEFAULT TRUE,
        isAdmin boolean DEFAULT FALSE,
        email VARCHAR(255) UNIQUE NOT NULL,
        addressLineOne VARCHAR(255) NOT NULL,
        addressLineTwo VARCHAR(255),
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255),
        country VARCHAR(255) NOT NULL,
        postalCode INTEGER NOT NULL,
        createdAt TIMESTAMP NOT NULL
          );
        `);

    await client.query(`
        CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        creatorId INTEGER REFERENCES users(id),
        categoryId INTEGER REFERENCES product_category(id),
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
        userId INTEGER REFERENCES users(id),
        paymentType VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        accountNo INTEGER NOT NULL,
        expire DATE NOT NULL
      );
    `);
    await client.query(`
        CREATE TABLE cart (
        id SERIAL PRIMARY KEY,
        userId INTEGER UNIQUE REFERENCES users(id)
    );
  `);
    await client.query(`
        CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cartId INTEGER REFERENCES cart(id),
        productId INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL
  );
`);

    await client.query(`
        CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id),
        total DECIMAL NOT NULL,
        createdAt TIMESTAMP NOT NULL
);
`);
    await client.query(`
        CREATE TABLE order_payment (
        id SERIAL PRIMARY KEY,
        orderId INTEGER UNIQUE REFERENCES orders(id),
        provider VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL
);
`);
    await client.query(`
        CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        orderId INTEGER REFERENCES orders(id),
        productId INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL
);
`);
    await client.query(`
        CREATE TABLE discounts (
        id SERIAL PRIMARY KEY,
        productId INTEGER UNIQUE REFERENCES products(id),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discountPercent DECIMAL NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP,
        modifiedAt TIMESTAMP,
        deletedAt TIMESTAMP
);
`);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  console.log("Starting to create users...");
  try {
    const usersToCreate = [
      {
        firstName: "Brent",
        lastName: "Purks",
        username: "bPurks",
        password: "testPass",
        addressLineOne: "1000 Main St.",
        addressLineTwo: "",
        city: "Dallas",
        state: "Texas",
        country: "US",
        postalCode: "75071",
        email: "testing@test1.com",
      },
      {
        firstName: "John",
        lastName: "Jones",
        username: "jJones",
        password: "testPass2",
        addressLineOne: "2222 Main St.",
        addressLineTwo: "",
        city: "Atlanta",
        state: "Georgia",
        country: "US",
        postalCode: "30040",
        email: "testing@test2.com",
      },
      {
        firstName: "Jake",
        lastName: "Harrison",
        username: "tHarrison",
        password: "testPass3",
        addressLineOne: "3333 Main St.",
        addressLineTwo: "",
        city: "Mckinney",
        state: "Texas",
        country: "US",
        postalCode: "75071",
        email: "testing@test3.com",
      },
    ];
    const users = await Promise.all(usersToCreate.map(createUser));
    console.log("Users created:");
    console.log(users);
    console.log("Finished creating users!");
    

  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}
async function createInitialCategories() {}
async function createInitialProducts() {}
async function createInitialDiscounts() {}
async function createInitialCarts() {}
async function createInitialPayments() {}
async function createInitialOrderHistory() {}

async function rebuildDB() {
  try {
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialCategories();
    await createInitialProducts();
    await createInitialDiscounts();
    await createInitialCarts();
    await createInitialPayments();
    await createInitialOrderHistory();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}

module.exports = {
  rebuildDB,
  dropTables,
  createTables,
};
