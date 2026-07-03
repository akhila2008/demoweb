import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is legitimate! Update Supabase order status in V2 Schema.
      
      // 1. Update Order Status
      const { error: updateOrderError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'CONFIRMED' })
        .eq('id', orderId);
        
      if (updateOrderError) {
        console.error("Order Update Error:", updateOrderError);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }

      // 2. Update Payment Status
      const { error: updatePaymentError } = await supabaseAdmin
        .from('payments')
        .update({ 
          razorpay_payment_id, 
          razorpay_signature, 
          status: 'CAPTURED' 
        })
        .eq('razorpay_order_id', razorpay_order_id);
        
      if (updatePaymentError) {
        console.error("Payment Update Error:", updatePaymentError);
        return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
      }

      // Note: At this point, inventory was already deducted by `checkout_order` SQL function.
      // If the payment had failed, a webhook or chron job would revert the inventory and cancel the order.

      return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid signature sent' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
