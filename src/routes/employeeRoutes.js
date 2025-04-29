import express from "express";
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    loginEmployee,
    resetPassword,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee);
router.put("/reset-password", authMiddleware, resetPassword);
router.get("/", authMiddleware, getAllEmployees);
router.get("/:id", authMiddleware, getEmployeeById);
router.put("/:id", authMiddleware, updateEmployee);
router.delete("/:id", authMiddleware, deleteEmployee);

export default router;
