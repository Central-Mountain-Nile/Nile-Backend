const client = require("./client");

async function createDiscount({
  productId,
  name,
  description,
  discountPercent,
  active,
}) {
  try {
    const { rows } = await client.query(
      `
            INSERT INTO discounts(
                "productId",
                name,
                description,
                "discountPercent",
                active,
                "createdAt")
            VALUES($1, $2, $3, $4, $5, to_timestamp(${Date.now()} / 1000.0))
            RETURNING *;
            `,

      [productId, name, description, discountPercent, active]
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

async function getDiscountsByProduct({ productId }) {
  try {
    const { rows } = await client.query(
      `
        SELECT *
        FROM discounts
        WHERE "productId" = $1;
        `,
      [productId]
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

    return await getDiscountsByProduct(productId);
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
