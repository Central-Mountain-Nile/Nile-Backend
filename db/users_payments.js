const client = require("./client");

async function createPayment({
  userId,
  paymentType,
  provider,
  accountNo,
  expire,
}) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO user_payments("userId", "paymentType", provider, "accountNo", expire) 
        VALUES($1, $2, $3, $4, $5) 
        RETURNING *;
      `,
      [userId, paymentType, provider, accountNo, expire]
    );
    return user;
  } catch (error) {
    throw error;
  }
}
async function getPaymentByUser(userId) {
  try {
    const { rows } = await client.query(
      `
        SELECT * 
        FROM user_payments
        WHERE "userId" = $1;
        `,
      [userId]
    );

    return rows;
  } catch (error) {
    throw {
      name: "PaymentNotFoundError",
      message: "Could not find payment with userId given",
    };
  }
}
async function getPaymentById(id) {
  try {
    const {
      rows: [userPayment],
    } = await client.query(
      `
        SELECT * 
        FROM user_payments
        WHERE id = $1;
        `,
      [id]
    );

    return userPayment;
  } catch (error) {
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
            UPDATE user_payments
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
          `,
        Object.values(fields)
      );
    }

    return await getPaymentById(id);
  } catch (error) {
    throw error;
  }
}
async function deletePayment(id) {
  try {
    const { rows } = await client.query(
      `
          DELETE FROM user_payments
          WHERE id = $1
          RETURNING *;
          `,
      [id]
    );

    return rows;
  } catch (error) {
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
