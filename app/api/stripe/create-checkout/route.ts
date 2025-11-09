import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !["pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Type assertion for MongoDB document
    const userId = (user._id as any).toString();

    const prices = {
      pro: {
        amount: 1999, // $19.99
        name: "Pro Plan",
      },
      enterprise: {
        amount: 9999, // $99.99
        name: "Enterprise Plan",
      },
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: prices[plan as keyof typeof prices].name,
              description: `Docume AI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
            },
            unit_amount: prices[plan as keyof typeof prices].amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: userId,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
