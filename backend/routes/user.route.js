const express = require("express");
const router = express.Router();
const {
    getUser,
    addUser,
    updateUser,
    deleteUser,
    getUserCur,
    getUserById,
} = require("../controllers/user.controller.js");
const authenticateToken = require("../routes/jwt.route.js");

router.post("/login", getUser);
router.post("/signup", addUser);
router.put("/", authenticateToken, updateUser);
router.delete("/", authenticateToken, deleteUser);
router.get("/", authenticateToken, getUserCur);
router.get("/get/:id", getUserById);

module.exports = router;
