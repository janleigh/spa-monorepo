import { useEffect, useState } from "react";

const QuantFigures = () => {
	const [figures, setFigures] = useState({
		farms: 0,
		farmers: 0,
		users: 0,
		harvest: 0,
		variety: 0,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("http://localhost:3001/api/data-count");				
				const data = await response.json();
				setFigures(data);
			} catch (error) {
				console.error("Error fetching quant figures:", error);
			}
		};

		fetchData();
	}, []);

	const items = [
		{ label: "Farms", value: figures.farms },
		{ label: "Farmers", value: figures.farmers },
		{ label: "Users", value: figures.users },
		{ label: "Harvest", value: figures.harvest },
		{ label: "Variety", value: figures.varieties },
	];

	return (
		<div className="quant-figures">
			<div className="figs">
				{items.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: mandatory
					<div className="fig" key={index}>
						<div className="quant-value">{item.value}</div>
						<span className="quant-label">{item.label}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default QuantFigures;
