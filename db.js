/** Database setup for BizTime. */
const {Client} = require("pg");
const fs = require("fs");

//I set up a password file so that I don't forget and accidentally upload my password to github
let db_password = fs.readFileSync("/var/www/cerebro/CodingBootcamp/Excercises/Node/express-biztime/db_password.txt", "utf8").trim();

let DB_URI = process.env.NODE_ENV === "test" ? `postgresql://akindeji:${db_password}@localhost:5432/biztime_test` : `postgresql://akindeji:${db_password}@localhost:5432/biztime`;

let db = new Client({ connectionString : DB_URI });

db.connect();

module.exports = db;