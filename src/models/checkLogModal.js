import mongoose from "mongoose";

const checkLogSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
        default: Date.now,
    },
    checkOut: {
        type: Date,
    },
}, { timestamps: true });

const CheckLog = mongoose.model("CheckLog", checkLogSchema);

export default CheckLog;