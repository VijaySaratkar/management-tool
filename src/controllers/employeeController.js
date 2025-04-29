import Employee from "../models/employeeModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import Organization from "../models/orgModel.js";
import mongoose from "mongoose";

// Create new employee
export const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            fatherName,
            employeeType,
            contactNumber,
            gender,
            joiningDate,
            manager,
            designation,
            password,
            profileImage,
        } = req.body;

        console.log("Logged-in employee =>", req.employee);

        // ✅ Step 1: Get full logged-in employee data
        const loggedInEmployee = await Employee.findById(req.employee.id);
        if (!loggedInEmployee) {
            return res.status(404).json({ message: "Logged-in employee not found" });
        }

        // ✅ Step 2: Extract orgId
        const orgId = loggedInEmployee.orgId;
        if (!orgId) {
            return res.status(400).json({ message: "Organization ID missing in employee data" });
        }

        // ✅ Step 3: Validate organization
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(400).json({ message: "Organization not found" });
        }

        // ✅ Step 4: Check for duplicate email
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee already exists" });
        }

        // ✅ Step 5: Generate random password if not provided
        const generateRandomPassword = (length = 12) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const plainPassword = password || generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // ✅ Step 6: Create employee
        const employee = await Employee.create({
            name,
            email,
            address,
            fatherName,
            employeeType,
            contactNumber,
            gender,
            joiningDate,
            manager: manager ? mongoose.Types.ObjectId(manager) : null,
            designation,
            profileImage,
            password: hashedPassword,
            orgId,
        });

        // ✅ Step 7: Send email
        const loginMessage = `Hi ${name},\nYour account has been created.\nLogin email: ${email}\nPassword: ${plainPassword}`;
        await sendEmail(email, "Your Employee Login Credentials", loginMessage);

        // ✅ Step 8: Populate orgId in the response
        const populatedEmployee = await Employee.findById(employee._id).populate("orgId", "name contactEmail");

        res.status(201).json({
            message: "Employee created and login credentials sent to email",
            employee: populatedEmployee,
        });
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



export const getAllEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        };

        const total = await Employee.countDocuments(query);
        const employees = await Employee.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("manager", "name email");

        res.status(200).json({ total, page, pages: Math.ceil(total / limit), employees });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate("manager", "name email");
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updated) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const loginEmployee = async (req, res) => {
    const { email, password } = req.body;
    try {
        const employee = await Employee.findOne({ email });
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.status(200).json({ token, employee });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Reset Password API
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        // Find employee
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update employee password
        employee.password = hashedPassword;
        await employee.save();

        // Optionally send confirmation email
        await sendEmail(email, "Password Reset Successful", `Hi ${employee.name}, your password has been updated.`);

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

