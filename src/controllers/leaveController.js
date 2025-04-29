import Leave from "../models/leaveModel.js";
import Employee from "../models/employeeModel.js";
import sendEmail from "../utils/sendEmail.js";

// 1. Create leave
export const applyLeave = async (req, res) => {
    try {
        const { subject, description, startDate, endDate, leaveType, notify } = req.body;

        const createdBy = req.employee.id;

        const leave = await Leave.create({
            subject,
            description,
            startDate,
            endDate,
            leaveType,
            notify,
            createdBy
        });

        // ✅ Send email to notify user
        const notifyUser = await Employee.findById(notify);
        if (notifyUser && notifyUser.email) {
            await sendEmail(
                notifyUser.email,
                "Leave Application Notification",
                `You have been notified about a leave application from ${notifyUser.name || "an employee"}.\n\nSubject: ${subject}\nLeave Type: ${leaveType}\nFrom: ${startDate}\nTo: ${endDate}`
            );
        }

        res.status(201).json({ message: "Leave applied successfully", leave });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Get all leaves
export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate([
            {
                path: "createdBy",
                select: "name email contactNumber designation profileImage manager",
                populate: {
                    path: "manager",
                    select: "name email profileImage designation contactNumber",
                },
            },
            {
                path: "notify",
                select: "name email profileImage designation contactNumber",
            },
            {
                path: "approvedBy",
                select: "name email profileImage designation contactNumber",
            },
        ]);

        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// 3. Get single leave
export const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate([
            {
                path: "createdBy",
                select: "name email contactNumber designation profileImage manager",
                populate: { path: "manager", select: "name email" },
            },
            { path: "notify", select: "name email" },
            { path: "approvedBy", select: "name email" },
        ]);

        if (!leave) return res.status(404).json({ message: "Leave not found" });

        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. Delete leave
export const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ message: "Leave not found" });

        res.status(200).json({ message: "Leave deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. Update leave status/details
export const updateLeave = async (req, res) => {
    try {
        const { status } = req.body;
        const approverId = req.employee.id;

        // Find the leave
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: "Leave not found" });

        // Update status and approvedBy
        if (status) leave.status = status;
        if (approverId) leave.approvedBy = approverId;

        await leave.save();

        // Send email to the employee who created the leave
        const creator = await Employee.findById(leave.createdBy);
        if (creator && status) {
            await sendEmail(
                creator.email,
                `Leave ${status === "approved" ? "Approved" : "Rejected"}`,
                `Your leave request has been ${status.toUpperCase()}.`
            );
        }

        // Populate approvedBy with name, email, profileImage, manager
        const populatedLeave = await Leave.findById(leave._id).populate([
            {
                path: "approvedBy",
                select: "name email profileImage manager",
                populate: {
                    path: "manager",
                    select: "name email profileImage designation contactNumber"
                }
            },
            {
                path: "createdBy",
                select: "name email contactNumber designation profileImage manager",
                populate: {
                    path: "manager",
                    select: "name email profileImage designation contactNumber"
                }
            },
            {
                path: "notify",
                select: "name email profileImage designation contactNumber"
            }
        ]);

        res.status(200).json({ message: "Leave updated", leave: populatedLeave });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};