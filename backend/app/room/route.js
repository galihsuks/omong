const express = require("express");
const router = express.Router();
const {
    addRoom,
    joinRoom,
    exitRoom,
    getRoom,
    updateRoom,
} = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.get("/join/:id", authenticateToken, joinRoom); //id room
router.get("/exit/:id", authenticateToken, exitRoom); //id room
router.get("/:id", authenticateToken, getRoom);
router.get("/", authenticateToken, getRoom);
router.post("/", authenticateToken, addRoom);
router.put("/:id", authenticateToken, updateRoom);

module.exports = router;
