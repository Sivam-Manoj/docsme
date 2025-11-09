import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocument extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  password?: string;
  shareableLink: string;
  views: number;
  styling: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    backgroundColor: string;
    textAlign: "left" | "center" | "right" | "justify";
  };
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Document",
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false,
    },
    shareableLink: {
      type: String,
      unique: true,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    styling: {
      fontSize: {
        type: Number,
        default: 16,
      },
      fontFamily: {
        type: String,
        default: "Arial",
      },
      textColor: {
        type: String,
        default: "#000000",
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      textAlign: {
        type: String,
        enum: ["left", "center", "right", "justify"],
        default: "left",
      },
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel: Model<IDocument> =
  (mongoose.models?.Document as Model<IDocument>) ||
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
