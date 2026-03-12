import BuildIcon from "@mui/icons-material/Build";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Link } from "react-router-dom";

const utilityTabs = [
	{ value: "1", label: "Accounts & User" },
	{ value: "2", label: "Farms Data" },
	{ value: "3", label: "Resource & Finance" },
	{ value: "4", label: "Monitoring & Logs" },
	{ value: "5", label: "Sales & Crops" },
];

const Sidebar = () => {
	return (
		<div className="sidem">
			<img src="RedPulp.png" alt="logo" id="logo" />
			<div className="sidem-inner">
				<div className="side-op">
					<div className="side-item">
						<Link to="/" className="sbar-icon">
							<HomeIcon />
							<span>Home</span>
						</Link>
						<Link to="/dashboard" className="sbar-icon">
							<DashboardIcon />
							<span>Dashboard</span>
						</Link>
						<div className="util-wrapper">
							<Link to="/utilities" className="sbar-icon">
								<BuildIcon />
								<span>Utilities</span>
							</Link>
							<div className="util-dropdown">
								{utilityTabs.map((tab) => (
									<Link
										key={tab.value}
										to={`/utilities/${tab.value}`}
										className="util-dropdown__item"
									>
										{tab.label}
									</Link>
								))}
							</div>
						</div>
						<Link to="/messages" className="sbar-icon">
							<MailOutlineIcon />
							<span>Agent Message</span>
						</Link>
					</div>
				</div>
				<div className="lo">
					<Link to="/logout" className="sbar-icon">
						<LogoutIcon />
						<span>Log Out</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
