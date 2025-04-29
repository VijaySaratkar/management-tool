import mongoose from "mongoose";

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    logo: { type: String, default: "" }, // Optional logo
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("Organization", orgSchema);
export default Organization;
