import express from "express";
import {
    applyLeave,
    getAllLeaves,
    getLeaveById,
    deleteLeave,
    updateLeave,
} from "../controllers/leaveController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, applyLeave);
router.get("/", authMiddleware, getAllLeaves);
router.get("/:id", authMiddleware, getLeaveById);
router.delete("/:id", authMiddleware, deleteLeave);
router.put("/:id", authMiddleware, updateLeave); 

export default router;
