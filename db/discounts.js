const client = require("./client");

async function createDiscount({
  product_id,
  name,
  description,
  discount_percent,
  active,
}) {
  try {
    const { rows } = await client.query(
      `
            INSERT INTO discounts(
                product_id,
                name,
                description,
                discount_percent,
                active,
                created_at,)
            VALUES($1, $2, $3, $4, $5, to_timestamp(${Date.now()} / 1000.0)),
            ON CONFLICT (name) DO NOTHING,
            RETURNING *;
            `,

      [product_id, name, description, discount_percent, active]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllDiscounts() {
  try {
    const { rows } = await client.query(
      `
            SELECT *
            FROM discounts;
            `
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getDiscountsByProduct({ product_id }) {
  try {
    const { rows } = await client.query(
      `
        SELECT *
        FROM discounts
        WHERE discounts.product_id = $1
        `,
      [product_id]
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function editDiscounts({ usersId, ...fields }) {
  fields.modifiedAt = "to_timestamp(${Date.now()} / 1000.0)";
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    if (setString.length > 0) {
      await client.query(
        `
              UPDATE discounts
              SET ${setString}
              WHERE id=${usersId}
              RETURNING *;
            `,
        Object.values(fields)
      );
    }

    return await getDiscountsByProduct(product_id);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteDiscounts(discountId) {
  try {
    const { rows } = await client.query(
      `
        UPDATE discounts
        SET boolean active = false
        WHERE id = $1
        RETURNING *;
        `,
      [discountId]
    );

    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createDiscount,
  getAllDiscounts,
  editDiscounts,
  getDiscountsByProduct,
  deleteDiscounts,
};
