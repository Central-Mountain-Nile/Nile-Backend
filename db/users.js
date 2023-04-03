const { createCart } = require("./carts");
const client = require("./client");
// const bcrypt = require("bcrypt");

async function createUser({
  firstName,
  lastName,
  username,
  password,
  addressLineOne,
  addressLineTwo,
  city,
  state,
  country,
  postalCode,
  email,
}) {
  //   const SALT_COUNT = 10;
  //   const hashpassword = await bcrypt.hash(password, SALT_COUNT);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(  
          "firstName",
          "lastName",
          username,
          password,
          "addressLineOne",
          "addressLineTwo",
          city,
          state,
          country,
          "postalCode",
          "createdAt",
          email)
  VALUES('${firstName}', '${lastName}', '${username}', '${password}', 
     '${addressLineOne}', '${addressLineTwo}', 
    '${city}', '${state}', '${country}', ${postalCode}, to_timestamp(${Date.now()} / 1000.0), '${email}')
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `
    );
    delete user.password;

    const cart = await createCart(user.id);
    user.cart = cart;
    return user;
  } catch (error) {
    throw error;
  }
}
async function getUsersByUsername(username) {
  try {
    const {
      rows: [users],
    } = await client.query(
      `
      SELECT * FROM users 
      WHERE username = $1;
    `,
      [username]
    );
    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function getUsersById(usersId) {
  try {
    const {
      rows: [users],
    } = await client.query(
      `
      SELECT * FROM users
      WHERE id = $1;
      `,
      [usersId]
    );
    console.log("users", users);
    delete users.password;
    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function getUser({ username, password }) {
  try {
    const {
      rows: [users],
    } = await client.query(
      `
      SELECT * FROM users 
      WHERE username = $1;
    `,
      [username]
    );
    if (password === users.password) {
      delete users.password;
      return users;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function patchUsers({ usersId, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    if (setString.length > 0) {
      await client.query(
        `
            UPDATE users
            SET ${setString}
            WHERE id=${usersId}
            RETURNING *;
          `,
        Object.values(fields)
      );
    }

    return await getUsersById(usersId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function deleteUsers(usersId) {
  try {
    const { rows } = await client.query(
      `
      UPDATE users
      SET boolean "isActive" = false
      WHERE id = $1
      RETURNING *;
      `,
      [usersId]
    );

    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports = {
  createUser,
  getUser,
  getUsersById,
  getUsersByUsername,
  patchUsers,
  deleteUsers,
};
