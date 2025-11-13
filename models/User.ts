import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  isVerified: boolean;
  provider?: string;
  subscription?: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "cancelled" | "expired";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  documentsCreated: number;
  uploadedImages?: Array<{
    _id: string;
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    image: String,
    emailVerified: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      currentPeriodEnd: Date,
    },
    documentsCreated: {
      type: Number,
      default: 0,
    },
    uploadedImages: [
      {
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  (mongoose.models?.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;
