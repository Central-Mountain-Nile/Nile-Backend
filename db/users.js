const client = require("./client");
// const bcrypt = require("bcrypt");

async function createUser({
  first_name,
  last_name,
  username,
  password,
  is_active,
  is_admin,
  address_line_one,
  address_line_two,
  city,
  state,
  country,
  postal_code,
  created_at,
}) {
  //   const SALT_COUNT = 10;
  //   const hashpassword = await bcrypt.hash(password, SALT_COUNT);

  try {
    const {
      rows: [users],
    } = await client.query(
      `
        INSERT INTO users(  
          first_name,
          last_name,
          username,
          password,
          is_active,
          is_admin,
          address_line_one,
          address_line_two,
          city,
          state,
          country,
          postal_code,
          created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [
        first_name,
        last_name,
        username,
        password,
        is_active,
        is_admin,
        address_line_one,
        address_line_two,
        city,
        state,
        country,
        postal_code,
        created_at,
      ]
    );
    delete users.password;
    return users;
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
    delete users.password;
    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function patchUsers({ usersId, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
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
      DELETE FROM users
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
  getUsersById,
  getUsersByUsername,
  patchUsers,
  deleteUsers,
};
