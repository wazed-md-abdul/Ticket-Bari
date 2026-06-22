import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { bookingId, ticketId, bookedQuantity } = session.metadata;

    try {
      const db = await getDb();
      const qty = Number(bookedQuantity);

      // 1. Update booking status to 'paid'
      await db.collection("bookings").updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: "paid" } }
      );

      // 2. Deduct seats from ticket inventory (only after confirmed payment)
      await db.collection("tickets").updateOne(
        { _id: new ObjectId(ticketId) },
        { $inc: { ticketQuantity: -qty } }
      );

      // 3. Log transaction details into 'transactions' collection
      await db.collection("transactions").insertOne({
        bookingId,
        paymentIntentId: session.payment_intent || "pi_mocked_" + Date.now(),
        amount: (session.amount_total || 0) / 100,
        email: session.customer_details?.email || session.email || "payment@ticketbari.com",
        createdAt: new Date(),
      });

      console.log(`Payment confirmed and inventory updated for Booking ID: ${bookingId}`);
    } catch (err) {
      console.error("Webhook Native DB transaction update failed:", err);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
export const dynamic = "force-dynamic";
