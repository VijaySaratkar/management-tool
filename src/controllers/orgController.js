import Organization from "../models/orgModel.js";
import Employee from "../models/employeeModel.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Create organization and first employee
export const createOrganization = async (req, res) => {
    try {
        const { name, address, contactEmail, contactPhone, logo } = req.body;

        // Check if organization exists
        const existing = await Organization.findOne({ contactEmail });
        if (existing) {
            return res.status(400).json({ message: "Organization already exists" });
        }

        // Step 1: Create organization
        const org = await Organization.create({ name, address, contactEmail, contactPhone, logo });
        console.log("<<<<<<org>>>>>>", org);

        // Step 2: Generate random password
        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Step 3: Create admin employee
        // Step 3: Create admin employee
        const employee = await Employee.create({
            name: name + " Admin",
            email: contactEmail,
            contactNumber: contactPhone,
            password: hashedPassword,
            orgId: org._id, // ✅ use orgId instead of organization
            designation: "Admin",
            role: "admin",
            profileImage: logo || "",
        });


        // Step 4: Send email with credentials
        await sendEmail(
            contactEmail,
            "Your Admin Account Credentials",
            `Welcome to ${name}!\n\nYour admin account has been created.\n\nLogin Email: ${contactEmail}\nPassword: ${plainPassword}`
        );

        res.status(201).json({
            message: "Organization and admin created. Credentials sent via email.",
            organization: org,
            employee,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// Get all organizations (important details only)
export const getAllOrganizations = async (req, res) => {
    try {
        const orgs = await Organization.find({}, "name address contactEmail contactPhone logo");
        res.status(200).json(orgs);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update organization
export const updateOrganization = async (req, res) => {
    try {
        const orgId = req.params.id;
        const updates = req.body;

        const updatedOrg = await Organization.findByIdAndUpdate(orgId, updates, { new: true });

        if (!updatedOrg) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json({ message: "Organization updated", org: updatedOrg });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

