const client = require("./client");

async function updateCartItem({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");
    const {
      rows: [cartItem],
    } = await client.query(
      `
        UPDATE cart_items
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );
    return cartItem;
  } catch (e) {
    throw e;
  }
}
async function deleteCartItem(id) {
  try {
    const {
      rows: [cartItem],
    } = await client.query(`
      DELETE FROM cart_items
      WHERE id=${id}
      RETURNING *;
    `);
    return cartItem;
  } catch (e) {
    throw e;
  }
}
module.exports = {
  deleteCartItem,
  updateCartItem,
};
