const client = require("./client");
// const bcrypt = require("bcrypt");

async function createUser({
  username,
  password,
  firstName,
  lastName,
  isActive,
  isAdmin,
  addressLine1,
  addressLine2,
  city,
  state,
  country,
  postalCode,
  CreatedAd,
}) {
  //   const SALT_COUNT = 10;
  //   const hashpassword = await bcrypt.hash(password, SALT_COUNT);

  try {
    const {
      rows: [users],
    } = await client.query(
      `
        INSERT INTO users(username, password)
        VALUES($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [username, hashpassword]
    );
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}
