import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationToken extends Document {
  email: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

const VerificationTokenSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto delete after 24 hours
  },
});

const VerificationToken: Model<IVerificationToken> =
  (mongoose.models?.VerificationToken as Model<IVerificationToken>) ||
  mongoose.model<IVerificationToken>(
    "VerificationToken",
    VerificationTokenSchema
  );

export default VerificationToken;
