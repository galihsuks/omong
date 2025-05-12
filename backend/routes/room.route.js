const express = require("express");
const router = express.Router();
const {
    getRooms,
    addRoom,
    joinRoom,
    exitRoom,
    getRoom,
    updateRoom,
} = require("../controllers/room.controller.js");
const {
    getChats,
    addChat,
    delChat,
} = require("../controllers/chat.controller.js");
const authenticateToken = require("../routes/jwt.route.js");

router.get("/", authenticateToken, getRooms);
router.get("/getroom/:id", authenticateToken, getRoom);
router.post("/", authenticateToken, addRoom);
router.put("/updateroom/:id", authenticateToken, updateRoom);
router.get("/join/:id", authenticateToken, joinRoom); //id room
router.get("/exit/:id", authenticateToken, exitRoom); //id room
router.get("/chat/:id", authenticateToken, getChats); //id room
router.post("/chat/:id", authenticateToken, addChat); // id room
router.delete("/chat/:id", authenticateToken, delChat); //id chat

module.exports = router;
