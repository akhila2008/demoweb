import { Request, Response } from 'express';
import { prisma } from '../index';
import crypto from 'crypto';
// import Razorpay from 'razorpay'; 
// Mocking razorpay for now since keys are needed

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod, shippingAddressId } = req.body;
    const userId = (req as any).user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Begin transaction for inventory deduction and order creation
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      
      // 1. Verify stock and calculate total
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        
        totalAmount += product.price * item.quantity;
        
        // Deduct inventory
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });

        // Log inventory transaction
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            reason: 'Order placed'
          }
        });
      }

      // Add shipping and GST
      const gst = totalAmount * 0.12;
      const shipping = totalAmount > 5000 ? 0 : 250;
      const grandTotal = totalAmount + gst + shipping;

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: grandTotal,
          paymentMethod,
          status: 'PENDING',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      return newOrder;
    });

    // If Razorpay, we would create a razorpay order here and return the order_id
    // const rzpOrder = await razorpay.orders.create({ amount: order.totalAmount * 100, currency: 'INR', receipt: order.id });
    
    res.status(201).json({ order, message: 'Order placed successfully' });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Server error creating order' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Mock signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', razorpayOrderId: razorpay_order_id }
      });
      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: (req as any).user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};
