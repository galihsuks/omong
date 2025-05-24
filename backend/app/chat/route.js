const express = require("express");
const router = express.Router();
const controller = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.post("/:id", authenticateToken, controller.addChat); //id room
router.delete("/:id", authenticateToken, controller.delChat); // id chat

module.exports = router;
