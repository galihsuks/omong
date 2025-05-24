const express = require("express");
const router = express.Router();
const {
    updateUser,
    deleteUser,
    getUserCur,
    getUserById,
} = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.put("/", authenticateToken, updateUser);
router.delete("/", authenticateToken, deleteUser);
router.get("/", authenticateToken, getUserCur);
router.get("/get/:id", getUserById);

module.exports = router;
