import Database from "better-sqlite3";

const db = new Database("./spa.db");

const rows = db.prepare("SELECT * from event_log").all();
console.log(rows);
