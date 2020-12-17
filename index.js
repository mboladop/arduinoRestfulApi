const sqlite3 = require('sqlite3');
const express = require("express");
var bodyParser = require('body-parser');
var app = express();

const HTTP_PORT = 3307
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

const db = new sqlite3.Database('./readings.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {

        db.run('CREATE TABLE readings( \
            reading_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            day NVARCHAR(20) NOT NULL,\
            data INTEGER\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
        });
    }
});

app.get("/readings/last", (req, res, next) => {
    db.get(`SELECT * FROM readings ORDER BY id DESC LIMIT 1`, [], (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(row);
      });
});

// readings/range/2020-12-17/2020-12-20
app.get("/readings/range/:from/:to", (req, res, next) => {
    var from = req.params.from;
    var to = req.params.to;
    db.all(`SELECT * from readings where day BETWEEN ? and ? ORDER BY day ASC`, [from, to], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(rows);
      });
});


app.post("/readings", (req, res, next) => {
    var reqBody = req.body;
    db.run(`INSERT INTO readings (day, data) VALUES (datetime('now'),?)`,
        [reqBody.data],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID
            })
        });
});