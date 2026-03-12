import { Box, Tab, Tabs } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Account from "../utilities/Account";
import CropVariety from "../utilities/CropVariety";
import Equipment from "../utilities/Equipment";
import EventLog from "../utilities/EventLog";
import Farm from "../utilities/Farm";
import Farmer from "../utilities/Farmer";
import FarmSupply from "../utilities/FarmSupply";
import FinancialRecord from "../utilities/FinancialRecord";
import Harvest from "../utilities/Harvest";
import PestDiseaseEvent from "../utilities/PestDiseaseEvent";
import PlantingBatch from "../utilities/PlantingBatch";
import Production from "../utilities/Production";
import Sale from "../utilities/Sale";
import Supply from "../utilities/Supply";
import User from "../utilities/User";
import WeatherLog from "../utilities/WeatherLog";

const tabsConfig = [
	{
		value: "1",
		label: "Accounts & User",
		components: {
			accounts: Account,
			users: User,
		},
	},
	{
		value: "2",
		label: "Farms Data",
		components: {
			farms: Farm,
			farmers: Farmer,
		},
	},
	{
		value: "3",
		label: "Resource & Finance",
		components: {
			financialRecords: FinancialRecord,
			supplies: Supply,
			farmSupplies: FarmSupply,
			equipment: Equipment,
		},
	},
	{
		value: "4",
		label: "Monitoring & Logs",
		components: {
			eventLogs: EventLog,
			weatherLogs: WeatherLog,
			pestDiseaseEvents: PestDiseaseEvent,
		},
	},
	{
		value: "5",
		label: "Sales & Crops",
		components: {
			cropVarieties: CropVariety,
			plantingBatches: PlantingBatch,
			production: Production,
			harvests: Harvest,
			sales: Sale,
		},
	},
];

const TabPanel = ({ value, index, children }) => {
	return value === index && <Box sx={{ p: 2 }}>{children}</Box>;
};

const Utility = () => {
	const { tab } = useParams();
	const [value, setValue] = React.useState(tab ?? "1");

	React.useEffect(() => {
		if (tab) setValue(tab);
	}, [tab]);

	const handleChange = (_event, newValue) => {
		setValue(newValue);
	};

	return (
		<div className="main-util">
			<Sidebar />
			<div className="util-cont">
				<div className="util-header">
					<h1>Utilities</h1>
				</div>
				<Box sx={{ width: "100%" }}>
					<Tabs
						value={value}
						onChange={handleChange}
						textColor="secondary"
						indicatorColor="secondary"
						variant="scrollable"
						scrollButtons="auto"
						sx={{
							"& .MuiTabs-flexContainer": { flexWrap: "wrap", gap: 1 },
							"& .MuiTab-root": { minWidth: "auto", textTransform: "none" },
						}}
					>
						{tabsConfig.map((tab) => (
							<Tab key={tab.value} label={tab.label} value={tab.value} />
						))}
					</Tabs>
				</Box>
				{/* Tab Panels */}
				{tabsConfig.map((tab) => (
					<TabPanel key={tab.value} value={value} index={tab.value}>
						{tab.components &&
							Object.entries(tab.components).map(([key, Comp]) => <Comp key={key} />)}
					</TabPanel>
				))}
			</div>
		</div>
	);
};

export default Utility;
