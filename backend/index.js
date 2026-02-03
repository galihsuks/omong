require("dotenv").config();
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
const app = express();
const port = 8083;
const mongoose = require("mongoose");
const roomRoute = require("./app/room/route.js");
const userRoute = require("./app/user/route.js");
const authRoute = require("./app/auth/route.js");
const chatRoute = require("./app/chat/route.js");

app.use(cors());
app.use(express.json());
app.use(useragent.express());

app.get("/backend", (req, res) => {
    res.send("API Ngomongo v1");
});

// routes
app.use("/backend/auth", authRoute);
app.use("/backend/room", roomRoute);
app.use("/backend/chat", chatRoute);
app.use("/backend/user", userRoute);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to mongoDB");
        app.listen(port, "0.0.0.0", () => {
            console.log(`Backend Ngomongo app listening on port ${port}`);
        });
    })
    .catch(() => {
        console.log("Connection to mongodb failed");
    });
