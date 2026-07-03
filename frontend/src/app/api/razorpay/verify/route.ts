import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      supabase_order_id 
    } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is legitimate! Update Supabase order status.
      
      // We must fetch the order, update the status, and save.
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('data')
        .eq('id', supabase_order_id)
        .single();
        
      if (fetchError || !orderData) {
        return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
      }
      
      const updatedData = {
        ...orderData.data,
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id
      };
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ data: updatedData })
        .eq('id', supabase_order_id);
        
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid signature sent' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
