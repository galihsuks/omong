require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 8081;
const mongoose = require("mongoose");
const roomRoute = require("./routes/room.route.js");
const userRoute = require("./routes/user.route.js");

app.use(cors());
app.use(express.json());

app.get("/backend/", (req, res) => {
    res.send("API Ngomongo v1");
});

// routes
app.use("/backend/room", roomRoute);
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
