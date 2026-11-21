
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: Number(process.env.TIDB_PORT) || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: {
        minVersion: "TLSv1.2"
    },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

function response(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export default async (request) => {
    try {
        const url = new URL(request.url);

        let pathname = url.pathname.replace(
            /^\/\.netlify\/functions\/api/,
            ""
        );

        if (pathname.startsWith("/api/")) {
            pathname = pathname.slice(4);
        }

        pathname = pathname.replace(/\/+$/, "") || "/";

        if (
            !process.env.TIDB_HOST ||
            !process.env.TIDB_USER ||
            !process.env.TIDB_PASSWORD ||
            !process.env.TIDB_DATABASE
        ) {
            return response({
                success: false,
                message: "Database environment variables sozlanmagan"
            }, 500);
        }

        if (pathname === "/notes" && request.method === "GET") {
            const [notes] = await pool.execute(
                `SELECT id, name, description,
                 created_at AS createdAt,
                 updated_at AS updatedAt
                 FROM notes ORDER BY id DESC`
            );

            return response({
                success: true,
                count: notes.length,
                data: notes
            });
        }

        if (pathname === "/notes" && request.method === "POST") {
            const body = await request.json();

            const name = typeof body.name === "string"
                ? body.name.trim()
                : "";

            const description = body.description == null
                ? null
                : typeof body.description === "string"
                    ? body.description.trim()
                    : undefined;

            if (
                name.length < 2 ||
                name.length > 100 ||
                description === undefined ||
                (description !== null && description.length > 1000)
            ) {
                return response({
                    success: false,
                    message: "Yuborilgan ma'lumot noto'g'ri"
                }, 400);
            }

            const [result] = await pool.execute(
                "INSERT INTO notes (name, description) VALUES (?, ?)",
                [name, description]
            );

            const [rows] = await pool.execute(
                `SELECT id, name, description,
                 created_at AS createdAt,
                 updated_at AS updatedAt
                 FROM notes WHERE id = ?`,
                [result.insertId]
            );

            return response({
                success: true,
                message: "Eslatma yaratildi",
                data: rows[0]
            }, 201);
        }

        const match = pathname.match(/^\/notes\/(\d+)$/);

        if (match && request.method === "PUT") {
            const id = Number(match[1]);
            const body = await request.json();

            const name = typeof body.name === "string"
                ? body.name.trim()
                : "";

            const description = body.description == null
                ? null
                : typeof body.description === "string"
                    ? body.description.trim()
                    : undefined;

            if (
                !Number.isSafeInteger(id) ||
                name.length < 2 ||
                name.length > 100 ||
                description === undefined ||
                (description !== null && description.length > 1000)
            ) {
                return response({
                    success: false,
                    message: "Yuborilgan ma'lumot noto'g'ri"
                }, 400);
            }

            const [result] = await pool.execute(
                `UPDATE notes
                 SET name = ?, description = ?
                 WHERE id = ?`,
                [name, description, id]
            );

            if (result.affectedRows === 0) {
                return response({
                    success: false,
                    message: "Eslatma topilmadi"
                }, 404);
            }

            const [rows] = await pool.execute(
                `SELECT id, name, description,
                 created_at AS createdAt,
                 updated_at AS updatedAt
                 FROM notes WHERE id = ?`,
                [id]
            );

            return response({
                success: true,
                message: "Eslatma yangilandi",
                data: rows[0]
            });
        }

        if (match && request.method === "DELETE") {
            const id = Number(match[1]);

            if (!Number.isSafeInteger(id)) {
                return response({
                    success: false,
                    message: "ID noto'g'ri"
                }, 400);
            }

            const [result] = await pool.execute(
                "DELETE FROM notes WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return response({
                    success: false,
                    message: "Eslatma topilmadi"
                }, 404);
            }

            return response({
                success: true,
                message: "Eslatma o'chirildi"
            });
        }

        return response({
            success: false,
            message: "Endpoint topilmadi"
        }, 404);

    } catch (error) {
        console.error("NETLIFY API ERROR:", error);

        return response({
            success: false,
            message: "Serverda ichki xatolik yuz berdi"
        }, 500);
    }
};
