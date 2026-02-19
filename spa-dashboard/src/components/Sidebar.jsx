import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LogoutIcon from "@mui/icons-material/Logout";

const Sidebar = () => {
	return (
		<div>
			<div className="sidem">
				<img src="RedPulp.png" alt="logo" id="logo" />
				<div className="sidem-inner">
					<div className="side-op">
						<div className="side-item">
							<ul>
								<li>
									<a className="sbar-icon" href="/">
										<HomeIcon />
										<span>Home</span>
									</a>
								</li>
								<li>
									<a className="sbar-icon" href="/dashboard">
										<DashboardIcon />
										<span>Dashboard</span>
									</a>
								</li>
								<li>
									<a className="sbar-icon" href="/utilities">
										<BuildIcon />
										<span>Utilities</span>
									</a>
								</li>
								<li>
									<a className="sbar-icon" href="/messages">
										<MailOutlineIcon />
										<span>Agent Message</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="lo">
						<a className="sbar-icon" href="/logout">
							<LogoutIcon />
							<span>Log Out</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
