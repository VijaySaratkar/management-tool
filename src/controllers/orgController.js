import Organization from "../models/orgModel.js";

// Create organization
export const createOrganization = async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone, logo } = req.body;

    const existing = await Organization.findOne({ name });
    if (existing) return res.status(400).json({ message: "Organization already exists" });

    const org = await Organization.create({ name, address, contactEmail, contactPhone, logo });
    res.status(201).json({ message: "Organization created", org });
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
  
