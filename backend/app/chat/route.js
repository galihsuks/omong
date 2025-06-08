const express = require("express");
const router = express.Router();
const controller = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.post("/:id", authenticateToken, controller.addChat); //id room
router.delete("/:id", authenticateToken, controller.delChat); // id chat
router.get("/one/:id", authenticateToken, controller.one); // id chat -> kyk e ini id room aja
router.get("/:id", authenticateToken, controller.seen); //id room

module.exports = router;
