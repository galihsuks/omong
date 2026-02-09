const express = require("express");
const router = express.Router();
const controller = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/login/:id", controller.loginId);
router.post("/logout", authenticateToken, controller.logout);

module.exports = router;
