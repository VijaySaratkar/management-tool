import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leaveType: { type: String, required: true },//enum: ['casual', 'sick', 'earned', 'other'],
    notify: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // For email notification
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Optional, updated on approval
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);
