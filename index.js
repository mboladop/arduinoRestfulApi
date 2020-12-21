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

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

const db = new sqlite3.Database('./readings.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {

        db.run('CREATE TABLE readings( \
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            day NVARCHAR(20),\
            data INTEGER\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
        });
        db.run('CREATE TABLE wattage( \
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            day NVARCHAR(20),\
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

// wattage/range/2020-12-17/2020-12-20
app.get("/wattage/range/:from/:to", (req, res, next) => {
    var from = req.params.from;
    var to = req.params.to;
    db.all(`SELECT * from wattage where day BETWEEN ? and ? ORDER BY day ASC`, [from, to], (err, rows) => {
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