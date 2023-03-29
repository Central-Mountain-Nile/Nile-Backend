const client = require("./client");
const { createUser } = require("./users");
const { createCategories } = require("./productCategory");
const { createProduct } = require("./products");
const { addToCart, getCart } = require("./cart");

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

let users = null;
let categories = null;
let products = null;
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
    let usersToCreate = [];
    for (let i = 0; i < 100; i++) {
      const firstName = makeid(10);
      const lastName = makeid(10);
      const username = makeid(9);
      const password = makeid(8);
      const addressLineOne = makeid(15);
      const city = makeid(12);
      const state = makeid(5);
      const country = "USA";
      const postalCode = Math.floor(Math.random() * 10000) + 1;
      const email = makeid(18);
      usersToCreate.push({
        firstName,
        lastName,
        username,
        password,
        addressLineOne,
        city,
        state,
        country,
        postalCode,
        email,
      });
    }
    users = await Promise.all(usersToCreate.map(createUser));
    console.log("Users created:");
    console.log(users);
    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}
async function createInitialCategories() {
  console.log("Starting to create categories...");
  const categoriesToCreate = [
    { name: "electronics" },
    { name: "clothing" },
    { name: "jewelry" },
    { name: "music" },
    { name: "auto" },
    { name: "gaming" },
    { name: "pets" },
    { name: "sports/lifestyle" },
    { name: "tools/appliances" },
    { name: "books" },
  ];
  try {
    categories = await Promise.all(categoriesToCreate.map(createCategories));
    console.log(categories);
    console.log("Finished creating categories!");
  } catch (error) {
    console.error("Error creating categories!");
    throw error;
  }
}

async function createInitialProducts() {
  console.log("Starting to create products...");
  let productsToCreate = [];
  for (let i = 0; i < 100; i++) {
    const creatorId = Math.floor(Math.random() * (users.length - 1)) + 1;
    const categoryId = Math.floor(Math.random() * (categories.length - 1)) + 1;
    const name = "testProduct" + i;
    const description = "initial product " + i;
    const price = Math.floor(Math.random() * 100000) / 100;
    const quantity = Math.floor(Math.random() * 500 + 1);
    productsToCreate.push({
      creatorId,
      categoryId,
      name,
      description,
      price,
      quantity,
    });
  }

  try {
    products = await Promise.all(productsToCreate.map(createProduct));
    console.log(products);
    console.log("Finished creating products!");
  } catch (error) {
    console.error("Error creating products!");
    throw error;
  }
}

async function createInitialDiscounts() {}
async function createInitialCarts() {
  console.log("Starting to fill carts...");
  try{
    for(let i = 0; i < users.length;i++){//for every user
      for(let j = 0; j< 5;j++){//add this many items to their cart
        const productId = Math.floor(Math.random() * (products.length - 1)) + 1;
        const quantity = Math.floor(Math.random() * 100) + 1;
        const cartId = users[i].cart.id
          await addToCart({productId,cartId,quantity})
      }
    }
    for(let i = 0; i < users.length; i++){
      console.log(await getCart(users[i].id))
    }
    console.log("Finished filling carts!");
  }catch(e){
    console.error("Error filling carts!");
    throw e
  }


}
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
