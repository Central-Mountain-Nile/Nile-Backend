const client = require('./client')

async function createProduct({
    creatorId,
    categoryId,
    name,
    description,
    price,
    quantity,
    img,
    active
}){
    try{
        const {rows: [products]} = await client.query(`
            INSERT INTO products(
                creator_id,
                category_id,
                name,
                description,
                price,
                quantity
                img,
                active
            )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
        `,[
            creatorId,
            categoryId,
            name,
            description,
            price,
            quantity,
            img,
            active
        ])
        return products
    }
    catch(error){
        throw error
    }
}
async function getProductById(productId){}
async function updateProduct({productId, ...fields}){}
async function getProductsByUser(usersId){}
async function getProductsByCategory(categoryId){}
async function deleteProduct(productId){}

module.exports = {
    createProduct,
    getProductById,
    updateProduct,
    getProductsByUser,
    getProductsByCategory,
    deleteProduct
}