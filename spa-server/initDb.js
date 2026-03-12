import Database from "better-sqlite3";

let db = null;

export function init() {
	if (db) return db;

	try {
		db = new Database("spa.db");
		console.log("Connected to the SQLite database.");
	} catch (err) {
		console.error("Error connecting to the SQLite database:", err);
		process.exit(1);
	}

	const schema = [
		`CREATE TABLE IF NOT EXISTS account (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			description TEXT NOT NULL,
			location TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS user (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			account_id INTEGER NOT NULL,
			role TEXT NOT NULL,
			FOREIGN KEY (account_id) REFERENCES account (id)
		)`,
		`CREATE TABLE IF NOT EXISTS event_log (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			user_id INTEGER NOT NULL,
			account_id INTEGER NOT NULL,
			action TEXT NOT NULL,
			metadata TEXT,
			FOREIGN KEY (user_id) REFERENCES user (id),
			FOREIGN KEY (account_id) REFERENCES account (id)
		)`,
		`CREATE TABLE IF NOT EXISTS agent_conversation (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			owner_user INTEGER NOT NULL,
			title TEXT NOT NULL,
			last_message_at DATETIME,
			FOREIGN KEY (owner_user) REFERENCES user (id)
		)`,
		`CREATE TABLE IF NOT EXISTS agent_message (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			conversation INTEGER NOT NULL,
			role TEXT NOT NULL,
			content TEXT NOT NULL,
			FOREIGN KEY (conversation) REFERENCES agent_conversation (id)
		)`,
		`CREATE TABLE IF NOT EXISTS farm (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			location TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS financial_record (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			record_date DATETIME NOT NULL,
			income DECIMAL NOT NULL,
			expenses DECIMAL NOT NULL,
			net_profit_loss DECIMAL NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
		`CREATE TABLE IF NOT EXISTS supply (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			description TEXT NOT NULL,
			unit_cost DECIMAL NOT NULL,
			quantity_on_hand INTEGER NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS farm_supply (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			supply_id INTEGER NOT NULL,
			quantity_used INTEGER NOT NULL,
			date_used DATETIME NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id),
			FOREIGN KEY (supply_id) REFERENCES supply (id)
		)`,
		`CREATE TABLE IF NOT EXISTS equipment (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			farm_id INTEGER NOT NULL,
			purchase_date DATETIME NOT NULL,
			last_maintenance_date DATETIME,
			next_maintenance_date DATETIME,
			status TEXT NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
		`CREATE TABLE IF NOT EXISTS weather_log (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			log_date DATETIME NOT NULL,
			temperature_celsius DECIMAL,
			humidity_percent DECIMAL,
			precipitation_mm DECIMAL,
			wind_speed_kmh DECIMAL,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
		`CREATE TABLE IF NOT EXISTS crop_variety (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			description TEXT NOT NULL,
			ideal_climate TEXT NOT NULL,
			average_yield_kg_per_hectare DECIMAL NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS planting_batch (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			tomato_type TEXT NOT NULL,
			planting_date DATETIME NOT NULL,
			expected_harvest_date DATETIME NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
		`CREATE TABLE IF NOT EXISTS production (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			planting_batch_id INTEGER NOT NULL,
			production_date DATETIME NOT NULL,
			yield_quantity_kg DECIMAL NOT NULL,
			notes TEXT,
			FOREIGN KEY (farm_id) REFERENCES farm (id),
			FOREIGN KEY (planting_batch_id) REFERENCES planting_batch (id)
		)`,
		`CREATE TABLE IF NOT EXISTS pest_disease_event (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			planting_batch_id INTEGER NOT NULL,
			event_date DATETIME NOT NULL,
			issue_type TEXT NOT NULL,
			treatment_applied TEXT NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id),
			FOREIGN KEY (planting_batch_id) REFERENCES planting_batch (id)
		)`,
		`CREATE TABLE IF NOT EXISTS harvest (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			harvest_date DATETIME NOT NULL,
			quantity_kg DECIMAL NOT NULL,
			quality TEXT NOT NULL,
			notes TEXT,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
		`CREATE TABLE IF NOT EXISTS sale (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			farm_id INTEGER NOT NULL,
			harvest_id INTEGER NOT NULL,
			sale_date DATETIME NOT NULL,
			customer_name TEXT NOT NULL,
			quantity_kg DECIMAL NOT NULL,
			revenue DECIMAL NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id),
			FOREIGN KEY (harvest_id) REFERENCES harvest (id)
		)`,
		`CREATE TABLE IF NOT EXISTS farmer (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
			farm_id INTEGER NOT NULL,
			role TEXT NOT NULL,
			salary DECIMAL NOT NULL,
			contact_info TEXT NOT NULL,
			FOREIGN KEY (farm_id) REFERENCES farm (id)
		)`,
	];

	for (const stmt of schema) {
		db.exec(stmt);
	}
	return db;
}

export function getInstance() {
	if (!db) throw new Error("Database not initialized. Call init() first.");
	return db;
}

export default db;
