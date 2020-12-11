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

const db = new sqlite3.Database('./emp_database.db', (err) => {
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
            let insert = 'INSERT INTO readings (day, data) VALUES (?,?)';
            db.run(insert, ["16/08/1989", "100"]);
            db.run(insert, ["17/09/1990", "200"]);
            db.run(insert, ["18/10/1991", "300"]);
        });
    }
});

app.get("/readings/:id", (req, res, next) => {
    var params = [req.params.id]
    db.get(`SELECT * FROM readings where reading_id = ?`, [params], (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(row);
      });
});


app.post("/readings", (req, res, next) => {
    var reqBody = req.body;
    db.run(`INSERT INTO readings (day, data) VALUES (?,?)`,
        [reqBody.day, reqBody.data],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "reading_id": this.lastID
            })
        });
});