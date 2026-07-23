import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe Secret Key (STRIPE_SECRET_KEY) is missing in environment variables." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const db = await getDb();
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "accepted") {
      return NextResponse.json({ error: "Booking must be accepted by vendor before payment." }, { status: 400 });
    }

    // Double check ticket availability and expiration
    const ticket = await db.collection("tickets").findOne({ _id: new ObjectId(booking.ticketId) });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (new Date(ticket.departureDateTime) < new Date()) {
      return NextResponse.json({ error: "Departure date/time has passed." }, { status: 400 });
    }

    if (ticket.ticketQuantity < booking.bookedQuantity) {
      return NextResponse.json({ error: "Not enough tickets available." }, { status: 400 });
    }

    // Resolve app base URL with fallback for Vercel deployments
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Generate Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${booking.ticketTitle} (${booking.transportType.toUpperCase()})`,
              description: `Route: ${ticket.from} to ${ticket.to} | Departs: ${new Date(ticket.departureDateTime).toLocaleString()}`,
            },
            unit_amount: Math.round(Number(ticket.price) * 100), // cents
          },
          quantity: booking.bookedQuantity,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard/user?status=success&bookingId=${bookingId}`,
      cancel_url: `${appUrl}/dashboard/user?status=cancel`,
      metadata: {
        bookingId: bookingId,
        ticketId: booking.ticketId,
        bookedQuantity: booking.bookedQuantity.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

