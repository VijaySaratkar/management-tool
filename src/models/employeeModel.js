import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        address: { type: String },
        fatherName: { type: String },
        employeeType: { type: String },
        contactNumber: { type: String },
        gender: { type: String },
        joiningDate: { type: Date },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: false,  // Optional Manager
        },
        designation: { type: String },
        profileImage: {
            type: String,
            default: "", // No image at start
        },
        password: { type: String, required: true }, // Encrypted password
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        hasLoggedIn: {
            type: Boolean,
            default: false,
        },
        password: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
