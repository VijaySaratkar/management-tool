import express from "express";
import {
    createOrganization,
    getAllOrganizations,
    updateOrganization,
} from "../controllers/orgController.js";

const router = express.Router();

router.post("/", createOrganization);
router.get("/", getAllOrganizations);
router.put("/:id", updateOrganization);

export default router;
