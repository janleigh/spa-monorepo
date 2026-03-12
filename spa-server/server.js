import { createServer } from "node:http";
import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import { Server as SocketIO } from "socket.io";
import { init } from "./initDb.js";

const PORT = 3001;
const db = init();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
	return res.status(200).json({ message: "ur gay" });
});

app.get("/api/user/", (_req, res) => {
	try {
		const rows = db
			.prepare("SELECT id, name, email, account_id, role FROM user")
			.all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/user/", async (req, res) => {
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

app.put("/api/user/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, account_id, role } = req.body;
		const result = db
			.prepare(
				"UPDATE user SET name = ?, email = ?, account_id = ?, role = ? WHERE id = ?",
			)
			.run(name, email, account_id, role, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "User not found" });
		io.emit("update-user", { id, name, email, account_id, role });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/user/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM user WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "User not found" });
		io.emit("delete-user", { id });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/account/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM account").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/account/", (req, res) => {
	try {
		const { name, description, location } = req.body;
		const result = db
			.prepare(
				"INSERT INTO account (name, description, location) VALUES (?,?,?)",
			)
			.run(name, description, location);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/account/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, location } = req.body;
		const result = db
			.prepare(
				"UPDATE account SET name = ?, description = ?, location = ? WHERE id = ?",
			)
			.run(name, description, location, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Account not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/account/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM account WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Account not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/farm/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM farm").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/farm/", (req, res) => {
	try {
		const { name, location } = req.body;
		const result = db
			.prepare("INSERT INTO farm (name, location) VALUES (?,?)")
			.run(name, location);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/farm/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, location } = req.body;
		const result = db
			.prepare("UPDATE farm SET name = ?, location = ? WHERE id = ?")
			.run(name, location, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farm not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/farm/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM farm WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farm not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/equipment/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM equipment").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/equipment/", (req, res) => {
	try {
		const {
			name,
			farm_id,
			purchase_date,
			last_maintenance_date,
			next_maintenance_date,
			status,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO equipment (name, farm_id, purchase_date, last_maintenance_date, next_maintenance_date, status) VALUES (?,?,?,?,?,?)",
			)
			.run(
				name,
				farm_id,
				purchase_date,
				last_maintenance_date || null,
				next_maintenance_date || null,
				status,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/equipment/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			name,
			farm_id,
			purchase_date,
			last_maintenance_date,
			next_maintenance_date,
			status,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE equipment SET name = ?, farm_id = ?, purchase_date = ?, last_maintenance_date = ?, next_maintenance_date = ?, status = ? WHERE id = ?",
			)
			.run(
				name,
				farm_id,
				purchase_date,
				last_maintenance_date || null,
				next_maintenance_date || null,
				status,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Equipment not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/equipment/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM equipment WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Equipment not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/supply/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM supply").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/supply/", (req, res) => {
	try {
		const { name, description, unit_cost, quantity_on_hand } = req.body;
		const result = db
			.prepare(
				"INSERT INTO supply (name, description, unit_cost, quantity_on_hand) VALUES (?,?,?,?)",
			)
			.run(name, description, unit_cost, quantity_on_hand);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/supply/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, unit_cost, quantity_on_hand } = req.body;
		const result = db
			.prepare(
				"UPDATE supply SET name = ?, description = ?, unit_cost = ?, quantity_on_hand = ? WHERE id = ?",
			)
			.run(name, description, unit_cost, quantity_on_hand, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Supply not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/supply/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM supply WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Supply not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/farm_supply/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM farm_supply").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/farm_supply/", (req, res) => {
	try {
		const { farm_id, supply_id, quantity_used, date_used } = req.body;
		const result = db
			.prepare(
				"INSERT INTO farm_supply (farm_id, supply_id, quantity_used, date_used) VALUES (?,?,?,?)",
			)
			.run(farm_id, supply_id, quantity_used, date_used);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/farm_supply/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { farm_id, supply_id, quantity_used, date_used } = req.body;
		const result = db
			.prepare(
				"UPDATE farm_supply SET farm_id = ?, supply_id = ?, quantity_used = ?, date_used = ? WHERE id = ?",
			)
			.run(farm_id, supply_id, quantity_used, date_used, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farm supply not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/farm_supply/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM farm_supply WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farm supply not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/farmer/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM farmer").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/farmer/", (req, res) => {
	try {
		const { name, farm_id, role, salary, contact_info } = req.body;
		const result = db
			.prepare(
				"INSERT INTO farmer (name, farm_id, role, salary, contact_info) VALUES (?,?,?,?,?)",
			)
			.run(name, farm_id, role, salary, contact_info);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/farmer/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { name, farm_id, role, salary, contact_info } = req.body;
		const result = db
			.prepare(
				"UPDATE farmer SET name = ?, farm_id = ?, role = ?, salary = ?, contact_info = ? WHERE id = ?",
			)
			.run(name, farm_id, role, salary, contact_info, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farmer not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/farmer/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM farmer WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Farmer not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/financial_record/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM financial_record").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/financial_record/", (req, res) => {
	try {
		const { farm_id, record_date, income, expenses, net_profit_loss } =
			req.body;
		const result = db
			.prepare(
				"INSERT INTO financial_record (farm_id, record_date, income, expenses, net_profit_loss) VALUES (?,?,?,?,?)",
			)
			.run(farm_id, record_date, income, expenses, net_profit_loss);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/financial_record/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { farm_id, record_date, income, expenses, net_profit_loss } =
			req.body;
		const result = db
			.prepare(
				"UPDATE financial_record SET farm_id = ?, record_date = ?, income = ?, expenses = ?, net_profit_loss = ? WHERE id = ?",
			)
			.run(farm_id, record_date, income, expenses, net_profit_loss, id);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Financial record not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/financial_record/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM financial_record WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Financial record not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/weather_log/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM weather_log").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/weather_log/", (req, res) => {
	try {
		const {
			farm_id,
			log_date,
			temperature_celsius,
			humidity_percent,
			precipitation_mm,
			wind_speed_kmh,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO weather_log (farm_id, log_date, temperature_celsius, humidity_percent, precipitation_mm, wind_speed_kmh) VALUES (?,?,?,?,?,?)",
			)
			.run(
				farm_id,
				log_date,
				temperature_celsius || null,
				humidity_percent || null,
				precipitation_mm || null,
				wind_speed_kmh || null,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/weather_log/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			farm_id,
			log_date,
			temperature_celsius,
			humidity_percent,
			precipitation_mm,
			wind_speed_kmh,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE weather_log SET farm_id = ?, log_date = ?, temperature_celsius = ?, humidity_percent = ?, precipitation_mm = ?, wind_speed_kmh = ? WHERE id = ?",
			)
			.run(
				farm_id,
				log_date,
				temperature_celsius || null,
				humidity_percent || null,
				precipitation_mm || null,
				wind_speed_kmh || null,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Weather log not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/weather_log/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM weather_log WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Weather log not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/crop_variety/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM crop_variety").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/crop_variety/", (req, res) => {
	try {
		const {
			name,
			description,
			ideal_climate,
			average_yield_kg_per_hectare,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO crop_variety (name, description, ideal_climate, average_yield_kg_per_hectare) VALUES (?,?,?,?)",
			)
			.run(
				name,
				description,
				ideal_climate,
				average_yield_kg_per_hectare,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/crop_variety/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			name,
			description,
			ideal_climate,
			average_yield_kg_per_hectare,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE crop_variety SET name = ?, description = ?, ideal_climate = ?, average_yield_kg_per_hectare = ? WHERE id = ?",
			)
			.run(
				name,
				description,
				ideal_climate,
				average_yield_kg_per_hectare,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Crop variety not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/crop_variety/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM crop_variety WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Crop variety not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/planting_batch/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM planting_batch").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/planting_batch/", (req, res) => {
	try {
		const { farm_id, tomato_type, planting_date, expected_harvest_date } =
			req.body;
		const result = db
			.prepare(
				"INSERT INTO planting_batch (farm_id, tomato_type, planting_date, expected_harvest_date) VALUES (?,?,?,?)",
			)
			.run(farm_id, tomato_type, planting_date, expected_harvest_date);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/planting_batch/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { farm_id, tomato_type, planting_date, expected_harvest_date } =
			req.body;
		const result = db
			.prepare(
				"UPDATE planting_batch SET farm_id = ?, tomato_type = ?, planting_date = ?, expected_harvest_date = ? WHERE id = ?",
			)
			.run(
				farm_id,
				tomato_type,
				planting_date,
				expected_harvest_date,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Planting batch not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/planting_batch/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM planting_batch WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Planting batch not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/production/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM production").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/production/", (req, res) => {
	try {
		const {
			farm_id,
			planting_batch_id,
			production_date,
			yield_quantity_kg,
			notes,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO production (farm_id, planting_batch_id, production_date, yield_quantity_kg, notes) VALUES (?,?,?,?,?)",
			)
			.run(
				farm_id,
				planting_batch_id,
				production_date,
				yield_quantity_kg,
				notes || null,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/production/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			farm_id,
			planting_batch_id,
			production_date,
			yield_quantity_kg,
			notes,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE production SET farm_id = ?, planting_batch_id = ?, production_date = ?, yield_quantity_kg = ?, notes = ? WHERE id = ?",
			)
			.run(
				farm_id,
				planting_batch_id,
				production_date,
				yield_quantity_kg,
				notes || null,
				id,
			);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Production record not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/production/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM production WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Production record not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/pest_disease_event/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM pest_disease_event").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/pest_disease_event/", (req, res) => {
	try {
		const {
			farm_id,
			planting_batch_id,
			event_date,
			issue_type,
			treatment_applied,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO pest_disease_event (farm_id, planting_batch_id, event_date, issue_type, treatment_applied) VALUES (?,?,?,?,?)",
			)
			.run(
				farm_id,
				planting_batch_id,
				event_date,
				issue_type,
				treatment_applied,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/pest_disease_event/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			farm_id,
			planting_batch_id,
			event_date,
			issue_type,
			treatment_applied,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE pest_disease_event SET farm_id = ?, planting_batch_id = ?, event_date = ?, issue_type = ?, treatment_applied = ? WHERE id = ?",
			)
			.run(
				farm_id,
				planting_batch_id,
				event_date,
				issue_type,
				treatment_applied,
				id,
			);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Pest/disease event not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/pest_disease_event/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM pest_disease_event WHERE id = ?")
			.run(id);
		if (result.changes === 0)
			return res
				.status(404)
				.json({ error: "Pest/disease event not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/harvest/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM harvest").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/harvest/", (req, res) => {
	try {
		const { farm_id, harvest_date, quantity_kg, quality, notes } = req.body;
		const result = db
			.prepare(
				"INSERT INTO harvest (farm_id, harvest_date, quantity_kg, quality, notes) VALUES (?,?,?,?,?)",
			)
			.run(farm_id, harvest_date, quantity_kg, quality, notes || null);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/harvest/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { farm_id, harvest_date, quantity_kg, quality, notes } = req.body;
		const result = db
			.prepare(
				"UPDATE harvest SET farm_id = ?, harvest_date = ?, quantity_kg = ?, quality = ?, notes = ? WHERE id = ?",
			)
			.run(
				farm_id,
				harvest_date,
				quantity_kg,
				quality,
				notes || null,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Harvest not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/harvest/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM harvest WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Harvest not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/sale/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM sale").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/sale/", (req, res) => {
	try {
		const {
			farm_id,
			harvest_id,
			sale_date,
			customer_name,
			quantity_kg,
			revenue,
		} = req.body;
		const result = db
			.prepare(
				"INSERT INTO sale (farm_id, harvest_id, sale_date, customer_name, quantity_kg, revenue) VALUES (?,?,?,?,?,?)",
			)
			.run(
				farm_id,
				harvest_id,
				sale_date,
				customer_name,
				quantity_kg,
				revenue,
			);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/sale/:id", (req, res) => {
	try {
		const { id } = req.params;
		const {
			farm_id,
			harvest_id,
			sale_date,
			customer_name,
			quantity_kg,
			revenue,
		} = req.body;
		const result = db
			.prepare(
				"UPDATE sale SET farm_id = ?, harvest_id = ?, sale_date = ?, customer_name = ?, quantity_kg = ?, revenue = ? WHERE id = ?",
			)
			.run(
				farm_id,
				harvest_id,
				sale_date,
				customer_name,
				quantity_kg,
				revenue,
				id,
			);
		if (result.changes === 0)
			return res.status(404).json({ error: "Sale not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/sale/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM sale WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Sale not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/event_log/", (_req, res) => {
	try {
		const rows = db.prepare("SELECT * FROM event_log").all();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/event_log/", (req, res) => {
	try {
		const { user_id, account_id, action, metadata } = req.body;
		const result = db
			.prepare(
				"INSERT INTO event_log (user_id, account_id, action, metadata) VALUES (?,?,?,?)",
			)
			.run(user_id, account_id, action, metadata || null);
		res.json({ success: true, id: result.lastInsertRowid });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/event_log/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { user_id, account_id, action, metadata } = req.body;
		const result = db
			.prepare(
				"UPDATE event_log SET user_id = ?, account_id = ?, action = ?, metadata = ? WHERE id = ?",
			)
			.run(user_id, account_id, action, metadata || null, id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Event log not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/event_log/:id", (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM event_log WHERE id = ?").run(id);
		if (result.changes === 0)
			return res.status(404).json({ error: "Event log not found" });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/data-count", (_req, res) => {
	try {
		const users = db.prepare("SELECT COUNT(*) AS count FROM user").get().count;
		const farms = db.prepare("SELECT COUNT(*) AS count FROM farm").get().count;
		const farmers = db.prepare("SELECT COUNT(*) AS count FROM farmer").get().count;
		const harvest = db.prepare("SELECT COUNT(*) AS count FROM harvest").get().count;
		const varieties = db.prepare("SELECT COUNT(*) AS count FROM crop_variety").get().count;
		res.json({ users, farms, farmers, harvest, varieties });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.use((err, _req, res, _next) => {
	const status = err.status ?? err.statusCode ?? 500;
	res.status(status).json({ error: err.message ?? "Internal server error" });
});

httpServer.listen(PORT, () => {
	console.log(`Server online on port ${PORT}`);
});
