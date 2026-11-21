import Product from "../model/Product.js";
import Order from '../model/Order.js'
import stripe from "stripe" 
import User from '../model/User.js'

// Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
       const {userId, items, address} = req.body;
       
       if(!address || items.length === 0) {
        return res.json({success: false, message: 'Invalid data!'});
       }

       // calc amount using items
       let amount = await items.reduce(async (acc, item) => {
        const productId = item.product || item.products;
        const product = await Product.findById(productId);
        if (!product) return await acc;
        return (await acc) + product.offerPrice * item.quantity;
       }, 0);

       // Add tax charge 2%
       amount += Math.floor(amount * 0.02);

       const formattedItems = items.map(item => ({
        product: item.product || item.products,
        quantity: item.quantity
       }));

       await Order.create({
        userId,
        items: formattedItems,
        amount,
        address,
        paymentType: "COD",
       });

        return res.json({success: true, message: "Order Place successfully!"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Place order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
       const {userId, items, address} = req.body;
       const {origin} = req.headers;
       
       if(!address || items.length === 0) {
        return res.json({success: false, message: 'Invalid data!'});
       }

       let productData = [];

       // calc amount using items
       let amount = await items.reduce(async (acc, item) => {
        const productId = item.product || item.products;
        const product = await Product.findById(productId);
        productData.push({
            name: product.name,
            price: product.offerPrice,
            quantity: item.quantity
        })
        if (!product) return await acc;
        return (await acc) + product.offerPrice * item.quantity;
       }, 0);

       // Add tax charge 2%
       amount += Math.floor(amount * 0.02);

       const formattedItems = items.map(item => ({
        product: item.product || item.products,
        quantity: item.quantity
       }));

       const order = await Order.create({
        userId,
        items: formattedItems,
        amount,
        address,
        paymentType: "Online",
       });

       // Stripe GateWay initialize
       const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

       // Create line items for stripe
       const line_items = productData.map((item) => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
            },
            quantity: item.quantity
        }
       });

       // create session
       const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
            orderId: order._id.toString(),
            userId,
        }
       });

        return res.json({success: true, url: session.url});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Stripe Webhooks to verify payment actions: /stripe
export const stripeWebhooks = async (req, res) => {
    // Stripe gateway init
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        res.status(400).send(`Webhooks Error: ${error.messsage}`);
    }

    // Handle event
    switch (event.type) {
        case "payment_intent.successed": {
            const paymentIntent = event.data.object;
            const paymentIntendId = paymentIntent.id;

            // Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntendId,  
            });

            const {orderId, userId} = session.data[0].metadata;

            // Mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true});
            // clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: {}});

            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntendId = paymentIntent.id;

            // Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntendId,  
            });

            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        } 
    
        default:
            console.error(`Unhandled event type ${event.type}`);
            break;
    }
    res.json({received: true});
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