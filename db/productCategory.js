const client = require("./client")

async function createCategories({
       category
      }) {

        try {
            const {
                rows: [product_category],
            } = await client.query(
                `
               INSERT INTO product_category(
               VALUES($1),
               ON CONFLICT (category) DO NOTHING,
               RETURNING *;
                `
            );
        } catch (error) {
            throw error;
        }
      }


module.exports = {
    createCategories
}