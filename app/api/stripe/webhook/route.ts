import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await User.findByIdAndUpdate(userId, {
            "subscription.plan": plan,
            "subscription.status": "active",
            "subscription.stripeCustomerId": session.customer,
            "subscription.stripeSubscriptionId": session.subscription,
            "subscription.currentPeriodEnd": new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await User.findOne({
          "subscription.stripeCustomerId": customerId,
        });

        if (user) {
          user.subscription!.status =
            subscription.status === "active" ? "active" : "cancelled";
          user.subscription!.currentPeriodEnd = new Date(
            (subscription as any).current_period_end * 1000
          );
          await user.save();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await User.findOne({
          "subscription.stripeCustomerId": customerId,
        });

        if (user) {
          user.subscription!.status = "expired";
          user.subscription!.plan = "free";
          await user.save();
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
