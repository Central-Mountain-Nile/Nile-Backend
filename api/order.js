const express = require("express");
const { 
    createOrder,
    getAllOrders,
    getOrder,
    getOrdersByUser 
    } = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//GET /api/order
router.get('/order', async (req, res, next) => {
    try{
        const allOrders = await getAllOrders()
        const order = allOrders.filter((order)=>{
            return order
        })
        res.send(order)
    }
    catch({name, message}){
        next({name, message})
    }
})

//POST /api/order
router.post('/order', requireUser, async (req, res, next) => {
    const {userId, total} = req.body
    const orderData = {
        orderId: req.user.id,
        userId,
        total
    }
    try{
        const order = await createOrder(orderData)
        if(order){
            res.send(order)
        }else{
            next({
                name: 'OrderCreationError',
                message: 'Invalid Order'
            })
        }
    }
    catch({name, message}){
        next({name, 
            message: `Order ID: ${orderId} already exists!`
        })
    }
})

module.exports = router;