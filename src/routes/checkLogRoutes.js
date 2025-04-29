import express from "express";
import { checkIn, checkOut, deleteCheckLog, getCheckLogs } from "../controllers/checkLogController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-in", authMiddleware, checkIn);
router.put("/check-out/:id", authMiddleware, checkOut);
router.get("/", authMiddleware, getCheckLogs);
router.delete("/:id", authMiddleware, deleteCheckLog);

export default router;
