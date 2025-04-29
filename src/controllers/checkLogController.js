import CheckLog from "../models/checkLogModal.js";
import Employee from "../models/employeeModel.js";


export const checkIn = async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const existingToday = await CheckLog.findOne({
            employee: employeeId,
            checkIn: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lte: new Date().setHours(23, 59, 59, 999),
            },
        });

        if (existingToday) {
            return res.status(400).json({ message: "Already checked in today" });
        }

        const checkLog = await CheckLog.create({
            employee: employeeId,
            checkIn: new Date(),
        });

        res.status(201).json({ message: "Checked in successfully", data: checkLog });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const checkOut = async (req, res) => {
    try {
        const { id } = req.params;
        const checkLog = await CheckLog.findById(id);

        if (!checkLog) return res.status(404).json({ message: "Check-in record not found" });
        if (checkLog.checkOut) {
            return res.status(400).json({ message: "Already checked out" });
        }

        checkLog.checkOut = new Date();
        await checkLog.save();

        res.status(200).json({ message: "Checked out successfully", data: checkLog });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
export const getCheckLogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, from, to, search } = req.query;
        const employeeId = req.employee.id;

        let filter = { employee: employeeId };

        if (from && to) {
            filter.checkIn = {
                $gte: new Date(from),
                $lte: new Date(to),
            };
        }

        if (search) {
            const employee = await Employee.findOne({ name: { $regex: search, $options: "i" } });
            if (employee) {
                filter.employee = employee._id;
            }
        }

        const total = await CheckLog.countDocuments(filter);

        const logs = await CheckLog.find(filter)
            .populate("employee", "name email profileImage designation contactNumber")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            data: logs,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// DELETE /api/checklogs/:id
export const deleteCheckLog = async (req, res) => {
    try {
        const { id } = req.params;

        const checkLog = await CheckLog.findById(id);
        if (!checkLog) {
            return res.status(404).json({ message: "Check log not found" });
        }

        // Optional: Only allow the user who created it or admin to delete
        if (checkLog.employee.toString() !== req.employee.id) {
            return res.status(403).json({ message: "Not authorized to delete this check log" });
        }

        await CheckLog.findByIdAndDelete(id);

        res.status(200).json({ message: "Check log deleted successfully" });
    } catch (error) {
        console.error("Delete CheckLog Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
