import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Utilities from "./pages/Utilities";
import "./styles/index.scss";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/utilities" element={<Utilities />} />
				<Route path="/utilities/:tab" element={<Utilities />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
