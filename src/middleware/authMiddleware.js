import jwt from "jsonwebtoken";

// JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Remove 'Bearer ' from the token if it's present
    const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.employee = decoded;  // Add the employee info to request object

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
