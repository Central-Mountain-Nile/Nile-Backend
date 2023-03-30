const client = require("./client");

async function createPayment({
  user_id,
  payment_type,
  provider,
  account_no,
  expire,
}) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO user_payments(user_id, payment_type, provider, account_no, expire) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `,
      [user_id, payment_type, provider, account_no, expire]
    );
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function getPaymentByUser(user_id) {
  try {
    const {
      rows: [user_payment],
    } = await client.query(
      `
        SELECT * 
        FROM user_payments
        WHERE user_id = $1;
        `,
      [user_id]
    );

    return user_payment;
  } catch (error) {
    console.log(error);
    throw {
      name: "PaymentNotFoundError",
      message: "Could not find payment with user_id given",
    };
  }
}
async function getPaymentById(id) {
  try {
    const {
      rows: [user_payment],
    } = await client.query(
      `
        SELECT * 
        FROM user_payment
        WHERE id = $1;
        `,
      [id]
    );

    return user_payment;
  } catch (error) {
    console.log(error);
    throw {
      name: "PaymentNotFoundError",
      message: "Could not find payment with id given",
    };
  }
}
async function patchPayment({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    if (setString.length > 0) {
      await client.query(
        `
            UPDATE user_payment
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
          `,
        Object.values(fields)
      );
    }

    return await getPaymentById(id);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function deletePayment(id) {
  try {
    const { rows } = await client.query(
      `
          DELETE FROM user_payment
          WHERE id = $1
          RETURNING *;
          `,
      [id]
    );

    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports = {
  createPayment,
  getPaymentByUser,
  patchPayment,
  getPaymentById,
  deletePayment,
};
