import Product from "../model/Product.js";
import Order from '../model/Order.js'

// Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
       const {userId, items, address} = req.body;
       
       if(!address || items.length === 0) {
        return res.json({success: false, message: 'Invalid data!'});
       }

       // calc amount using items
       let amount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        return (await acc) + product.offerPrice * item.quantity;
       }, 0);

       // Add tax charge 2%
       amount += Math.floor(amount * 0.02);

       await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: "COD",
       });

        return res.json({success: true, message: "Order Place successfully!"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Get order by user ID: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const {userId} = req.body;

        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success: true, orders});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Get All order for seller and admin: /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success: true, orders});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}