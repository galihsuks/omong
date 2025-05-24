require("dotenv").config();
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
const app = express();
const port = 8081;
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

// =========================

const WebSocket = require("ws");
const { parse } = require("url");
const server = new WebSocket.Server({ port: 4001 });
const rooms = {};

server.on("connection", (socket, req) => {
    const { query } = parse(req.url, true);
    const idroom = query.idroom ? query.idroom : "XXXXX";

    if (!idroom) {
        server.close(1008, "idroom is required");
        return;
    }

    //kalau idroomnya blm ada
    if (!sensors[idroom]) {
        sensors[idroom] = new Set();
    }

    sensors[idroom].add(socket);
    // console.log(`Client telah terkoneksi ke sensor ${idroom}`);

    socket.on("message", (message, isBinary) => {
        try {
            const msgStr = isBinary
                ? message.toString("utf8")
                : message.toString();

            let datanya;
            if (msgStr.includes("{") && msgStr.includes("}")) {
                try {
                    datanya = JSON.parse(msgStr);
                    datanya.idroom = idroom;
                } catch (e) {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(
                            JSON.stringify({
                                success: false,
                                pesan: "Format JSON tidak valid",
                            })
                        );
                    }
                    return;
                }
                // {
                //     nilai: '', harus string
                //     iddata: 0,
                //     action: 'edit', 'delete'
                // }
            } else {
                datanya = {
                    idroom: idroom,
                    nilai: msgStr,
                    waktu: Date.now(),
                };
            }

            function isNumber(string) {
                const value = string.replace(",", ".");
                return !isNaN(value);
            }

            async function postData() {
                try {
                    const sensorSelected = await connection.promise().query(
                        `
                        SELECT sensor.*, user.passkey, struktur_data.string 
                        FROM sensor 
                        JOIN user ON user.id = sensor.id_user 
                        JOIN struktur_data ON sensor.id_struktur = struktur_data.id 
                        WHERE sensor.id = ?`,
                        [idroom]
                    );
                    if (sensorSelected[0].length == 0)
                        return console.log(
                            `Sensor ${idroom} tidak ditemukan (ini dari socket)`
                        );

                    let isWrong = [false, ""];

                    if (
                        sensorSelected[0][0].string &&
                        isNumber(datanya.nilai)
                    ) {
                        isWrong[0] = true;
                        isWrong[1] = "Data harus berupa string";
                    } else if (
                        !sensorSelected[0][0].string &&
                        !isNumber(datanya.nilai)
                    ) {
                        isWrong[0] = true;
                        isWrong[1] = "Data harus berupa number";
                    }

                    if (sensorSelected[0][0].passkey != passkey) {
                        isWrong[0] = true;
                        isWrong[1] = "Passkey salah";
                    }
                    if (isWrong[0]) {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(
                                JSON.stringify({
                                    success: false,
                                    pesan: isWrong[1],
                                })
                            );
                        }
                        return;
                    }

                    // let dataCur = await connection
                    //     .promise()
                    //     .query(`SELECT data FROM sensor WHERE id = ?;`, [
                    //         idroom,
                    //     ]);
                    // let dataCurNew;
                    if (datanya.action) {
                        if (datanya.action == "delete") {
                            await connection
                                .promise()
                                .query(`DELETE FROM data WHERE id = ?;`, [
                                    datanya.iddata,
                                ]);
                            // dataCurNew = dataCur[0].filter(
                            //     (d) => d.id != datanya.iddata
                            // );
                        } else if (datanya.action == "edit") {
                            await connection
                                .promise()
                                .query(
                                    `UPDATE data SET nilai = ? WHERE id = ?;`,
                                    [datanya.iddata]
                                );
                            // dataCurNew = dataCur[0].map((d) => {
                            //     if (d.id == datanya.iddata) {
                            //         return {
                            //             ...d,
                            //             nilai: isNumber(datanya.nilai)
                            //                 ? Number(datanya.nilai)
                            //                 : datanya.nilai,
                            //         };
                            //     } else return d;
                            // });
                        } else {
                            if (socket.readyState === WebSocket.OPEN) {
                                socket.send(
                                    JSON.stringify({
                                        success: false,
                                        pesan: "Action tidak dikenali",
                                    })
                                );
                            }
                            return;
                        }
                    } else {
                        const hasilInsert = await connection
                            .promise()
                            .query(
                                `INSERT INTO data (id_sensor, waktu, nilai) VALUES (?, ? ,?);`,
                                [idroom, datanya.waktu, datanya.nilai]
                            );
                        // dataCurNew = [
                        //     ...dataCur[0],
                        //     {
                        //         id: hasilInsert[0].insertId,
                        //         idroom: idroom,
                        //         waktu: datanya.waktu,
                        //         nilai: isNumber(datanya.nilai)
                        //             ? Number(datanya.nilai)
                        //             : datanya.nilai,
                        //     },
                        // ];
                    }

                    sensors[idroom].forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            if (client !== socket) {
                                client.send(
                                    JSON.stringify({
                                        ...datanya,
                                        action: datanya.action,
                                        idroom: datanya.idroom,
                                    })
                                ); // Kirim pesan ke semua klien
                            } else {
                                socket.send(
                                    JSON.stringify({
                                        success: true,
                                        pesan: "Data berhasil terupdate",
                                    })
                                );
                            }
                        }
                    });
                } catch (error) {
                    console.error(error.message);
                    sensors[idroom].forEach((client) => {
                        if (
                            client !== socket &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            client.send(
                                JSON.stringify({
                                    success: false,
                                    pesan: "Terjadi kesalahan pada server websocket",
                                })
                            ); // Kirim pesan ke semua klien
                        }
                    });
                }
            }
            postData();
        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on("close", () => {
        sensors[idroom].delete(socket);
        // console.log(`Client left sensor ${idroom}`);

        if (sensors[idroom].size === 0) {
            delete sensors[idroom];
        }
    });
});

console.log("WebSocket server running on ws://localhost:4002");
