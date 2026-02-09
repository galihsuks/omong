const express = require("express");
const router = express.Router();
const {
    updateUser,
    deleteUser,
    getUserCur,
    getBy,
    online,
    getUserOne,
} = require("./controller.js");
const authenticateToken = require("../token/route.js");

router.put("/", authenticateToken, updateUser);
router.delete("/", authenticateToken, deleteUser);
router.get("/", authenticateToken, getUserCur);
router.post("/one", getUserOne);
router.post("/getby/:filter", authenticateToken, getBy);
router.post("/online", authenticateToken, online);

module.exports = router;
