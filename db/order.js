const client = require("./client");
const { createOrderItems } = require("./orderItems");

async function createOrder({ userId, total }) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
          INSERT INTO orders("userId", total,"createdAt")
          VALUES(${userId},${total},to_timestamp(${Date.now()} / 1000.0) )
          RETURNING *; 
          `
    );
    return order;
  } catch (e) {
    throw e;
  }
}
async function getAllOrders() {
  try {
    const { rows } = await client.query(
      `
              SELECT orders.*, order_items.*, order_payment.*
              FROM orders
              JOIN order_items ON orders.id=order_items."orderId"
              JOIN order_payment ON orders.id=order_payment."orderId";
              `
    );
    return rows;
  } catch (e) {
    throw e;
  }
}
async function getOrder(orderId) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
              SELECT orders.*, order_items.*, payment_details.*
              FROM orders
              JOIN order_items ON orders.id=order_items."orderId"
              JOIN payment_details ON orders.id=payment_details."orderId"
              WHERE orders.id=${orderId};
              `
    );
    return order;
  } catch (e) {
    throw e;
  }
}
async function getOrdersByUser(userId) {
  try {
    const { rows } = await client.query(
      `
              SELECT orders.*, order_items.*, payment_details.*
              FROM orders
              JOIN order_items ON orders.id=order_items."orderId"
              JOIN payment_details ON orders.id=payment_details."orderId"
              WHERE orders."userId"=${userId};
              `
    );
    return rows;
  } catch (e) {
    throw e;
  }
}
async function updateOrder({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    if (setString.length > 0) {
      await client.query(
        `
          UPDATE orders
          SET ${setString}
          WHERE id=${id}
          RETURNING *;
        `,
        Object.values(fields)
      );
    }

    return await getOrder(id);
  } catch (error) {
    throw error;
  }
}

async function deleteOrder(usersId) {
  try {
    const { rows } = await client.query(
      `
      DELETE FROM orders
      WHERE id = $1
      RETURNING *;
      `,
      [usersId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrder,
  getOrdersByUser,
  updateOrder,
  deleteOrder,
};
