import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const db = await getDb();
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "paid") {
      return NextResponse.json({ success: true, message: "Booking already paid" });
    }

    const qty = Number(booking.bookedQuantity || 1);

    // 1. Update booking status to 'paid'
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { status: "paid" } }
    );

    // 2. Deduct seats from ticket inventory
    if (booking.ticketId) {
      await db.collection("tickets").updateOne(
        { _id: new ObjectId(booking.ticketId) },
        { $inc: { ticketQuantity: -qty } }
      );
    }

    // 3. Log transaction details into 'transactions' collection if not already recorded
    const existingTx = await db.collection("transactions").findOne({ bookingId: bookingId.toString() });
    if (!existingTx) {
      await db.collection("transactions").insertOne({
        bookingId: bookingId.toString(),
        paymentIntentId: "pi_stripe_" + Date.now(),
        amount: booking.totalPrice || 0,
        email: booking.userEmail || "payment@ticketbari.com",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
