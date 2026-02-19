// biome-ignore assist/source/organizeImports: no
import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server as SocketIO } from "socket.io";
import { init } from "./initDb.js";

const db = init();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
	return res.status(200).json({ message: "ur gay" });
});

app.post("/api/user", async (req, res) => {
	try {
		const { name, email, password, account_id, role } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const sql =
			"INSERT INTO user (name, email, password, account_id, role) VALUES (?,?,?,?,?)";
		const result = db
			.prepare(sql)
			.run(name, email, hashedPassword, account_id, role);
		const newUser = {
			id: result.lastInsertRowid,
			name,
			email,
			account_id,
			role,
		};
		io.emit("new-user", newUser);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/account", (req, res) => {
	try {
		const { name, description, location } = req.body;
		const sql =
			"INSERT INTO account (name, description, location) VALUES (?,?,?)";
		const result = db.prepare(sql).run(name, description, location);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/user/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, account_id, role } = req.body;
		const stmt = db.prepare(
			"UPDATE user SET name = ?, email = ?, account_id = ?, role = ? WHERE id = ?",
		);
		const result = stmt.run(name, email, account_id, role, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "User not found" });
		io.emit("update-user", { id, name, email, account_id, role });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

httpServer.listen(8080, () => {
	console.log("Server online!");
});
