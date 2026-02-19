import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./pages/Dashboard";
import Utilities from "./pages/Utilities";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.scss";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/utilities" element={<Utilities />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
