require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: Number(process.env.TIDB_PORT) || 4000,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: "mysql_demo",
            ssl: { minVersion: "TLSv1.2" }
        });

        const [tables] = await connection.query("SHOW TABLES");

        console.log("BAZA: mysql_demo");
        console.log("JADVALLAR:", tables);

        const [notes] = await connection.query("SELECT * FROM notes LIMIT 5");

        console.log("NOTES JADVALI:", notes);

    } catch (error) {
        console.error("MYSQL TEST ERROR:", error);
    } finally {
        if (connection) await connection.end();
    }
}

test();