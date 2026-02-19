import QuantFigures from "../components/QuantFigures";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
	return (
		<div>
			<div className="main-dash">
				<Sidebar />
				<div className="dash-cont">
					<div className="dash-header">
						<h1>Dashboard</h1>
						<QuantFigures />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
