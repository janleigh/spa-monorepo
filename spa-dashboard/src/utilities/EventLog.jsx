import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
	Box,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";

const sxIconBtn = {
	background: "#060745",
	color: "#eee6e3",
	borderRadius: "8px",
	boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
	transition: "all 0.2s",
};
const sxTh = { fontWeight: 600, py: 0.55 };
const sxTd = { py: 0.55 };
const sxTdEdit = { py: 0 };

const FIELDS = ["user_id", "account_id", "action", "metadata"];
const FIELD_LABELS = ["User ID", "Account ID", "Action", "Metadata"];
const EDIT_FIELDS = ["user_id", "account_id", "action", "metadata"];

function TablePaginationActions(props) {
	const theme = useTheme();
	const { count, page, rowsPerPage, onPageChange } = props;

	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
				{theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
				{theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				onClick={(e) => onPageChange(e, page + 1)}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
			>
				{theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
			</IconButton>
			<IconButton
				onClick={(e) => onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
			>
				{theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
			</IconButton>
		</Box>
	);
}

const EventLog = () => {
	const [rows, setRows] = React.useState([]);
	const [editingId, setEditingId] = React.useState(null);
	const [editRow, setEditRow] = React.useState({});
	const [searchKeyword, setSearchKeyword] = React.useState("");
	const [appliedSearch, setAppliedSearch] = React.useState("");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [openSearch, setOpenSearch] = React.useState(false);
	const [openAdd, setOpenAdd] = React.useState(false);

	const emptyNew = { user_id: "", account_id: "", action: "", metadata: "" };
	const [newRow, setNewRow] = React.useState(emptyNew);

	const fetchRows = async () => {
		try {
			const res = await fetch("http://localhost:3001/api/event_log/");
			const data = await res.json();
			setRows(data);
		} catch (err) {
			console.error(err);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	React.useEffect(() => {
		fetchRows();
		const interval = setInterval(fetchRows, 5000);
		return () => clearInterval(interval);
	}, []);

	const toggleSearch = () => {
		setOpenSearch((prev) => {
			const next = !prev;
			if (next) setOpenAdd(false);
			return next;
		});
	};

	const toggleAdd = () => {
		setOpenAdd((prev) => {
			const next = !prev;
			if (next) setOpenSearch(false);
			return next;
		});
	};

	const filteredRows = appliedSearch
		? rows.filter((row) =>
				Object.values(row).some((val) =>
					val?.toString().toLowerCase().includes(appliedSearch.toLowerCase()),
				),
			)
		: rows;

	const emptyRows = page > 0 ? Math.max(3, (1 + page) * rowsPerPage - filteredRows.length) : 0;

	const handleChangePage = (_, newPage) => setPage(newPage);

	const handleChangeRowsPerPage = (e) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const handleSearchSubmit = () => {
		setAppliedSearch(searchKeyword);
		setPage(0);
	};

	const handleAdd = async () => {
		try {
			const res = await fetch("http://localhost:3001/api/event_log/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newRow),
			});
			const data = await res.json();
			if (data.success) {
				setNewRow(emptyNew);
				setOpenAdd(false);
				fetchRows();
			} else {
				alert(`Failed to add event log: ${data.error ?? "Unknown error"}`);
			}
		} catch (err) {
			console.error(err);
			alert(`Network error: ${err.message}`);
		}
	};

	const startEdit = (row) => {
		setEditingId(row.id);
		setEditRow({ ...row });
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditRow({});
	};

	const saveEdit = async () => {
		try {
			const body = {};
			for (const f of EDIT_FIELDS) body[f] = editRow[f];
			const res = await fetch(`http://localhost:3001/api/event_log/${editingId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await res.json();
			if (data.success) {
				setEditingId(null);
				fetchRows();
			} else {
				alert(`Failed to save event log: ${data.error ?? "Unknown error"}`);
			}
		} catch (err) {
			console.error(err);
			alert(`Network error: ${err.message}`);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this event log?")) return;
		try {
			await fetch(`http://localhost:3001/api/event_log/${id}`, {
				method: "DELETE",
			});
			fetchRows();
		} catch (err) {
			console.error(err);
		}
	};

	const totalCols = FIELDS.length + 3; // ID + fields + Edit + Delete

	return (
		<Box>
			<Box className="acct-toolbar">
				<h2>Event Logs</h2>

				<SearchRoundedIcon
					sx={{
						...sxIconBtn,
						fontSize: 35,
						padding: "5px",
						cursor: openAdd ? "not-allowed" : "pointer",
						opacity: openAdd ? 0.4 : 1,
						pointerEvents: openAdd ? "none" : "auto",
					}}
					onClick={toggleSearch}
				/>

				<Box
					sx={{
						width: openSearch ? "300px" : "0",
						transition: "width 0.3s ease",
						overflow: "hidden",
						display: "flex",
						alignItems: "center",
					}}
				>
					<TextField
						fullWidth
						label="Search any keyword..."
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
						size="small"
					/>
					<Button
						sx={{ ml: 1, background: "#060745" }}
						variant="contained"
						onClick={handleSearchSubmit}
					>
						Search
					</Button>
				</Box>

				<AddCircleRoundedIcon
					sx={{
						...sxIconBtn,
						fontSize: 30,
						padding: "8px",
						cursor: openSearch ? "not-allowed" : "pointer",
						opacity: openSearch ? 0.4 : 1,
						pointerEvents: openSearch ? "none" : "auto",
					}}
					onClick={toggleAdd}
				/>

				<Box
					sx={{
						width: openAdd ? "780px" : "0",
						transition: "width 0.3s ease",
						overflow: "hidden",
						display: "flex",
						gap: 1,
						alignItems: "center",
					}}
				>
					{FIELDS.map((field, i) => (
						<TextField
							key={field}
							required
							label={FIELD_LABELS[i]}
							size="small"
							value={newRow[field]}
							onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
						/>
					))}
					<Button
						variant="contained"
						disabled={FIELDS.filter((f) => f !== "metadata").some((f) => !newRow[f])}
						onClick={handleAdd}
						sx={{ background: "#060745" }}
					>
						Add
					</Button>
				</Box>
			</Box>

			<TableContainer
				component={Paper}
				sx={{
					borderRadius: "12px",
					boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
					padding: "10px",
				}}
			>
				<Table stickyHeader>
					<TableHead>
						<TableRow sx={{ height: 25 }}>
							<TableCell sx={sxTh}>ID</TableCell>
							{FIELD_LABELS.map((col) => (
								<TableCell key={col} sx={sxTh}>
									{col}
								</TableCell>
							))}
							<TableCell sx={{ ...sxTh, py: 0.75 }} align="center">
								Edit
							</TableCell>
							<TableCell sx={{ ...sxTh, py: 0.75 }} align="center">
								Delete
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{(rowsPerPage > 0
							? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							: filteredRows
						).map((row) => (
							<TableRow key={row.id} sx={{ height: 25 }}>
								<TableCell sx={sxTd}>{row.id}</TableCell>

								{editingId === row.id ? (
									<>
										{EDIT_FIELDS.map((field) => (
											<TableCell key={field} sx={sxTdEdit}>
												<TextField
													size="small"
													value={editRow[field] ?? ""}
													onChange={(e) => setEditRow({ ...editRow, [field]: e.target.value })}
												/>
											</TableCell>
										))}
										<TableCell colSpan={2}>
											<Button size="small" onClick={saveEdit}>
												<SaveAltIcon />
											</Button>
											<Button size="small" onClick={cancelEdit}>
												<CancelPresentationIcon />
											</Button>
										</TableCell>
									</>
								) : (
									<>
										{FIELDS.map((field) => (
											<TableCell key={field} sx={sxTd}>
												{row[field]}
											</TableCell>
										))}
										<TableCell sx={sxTd} align="center">
											<IconButton onClick={() => startEdit(row)}>
												<EditRoundedIcon />
											</IconButton>
										</TableCell>
										<TableCell sx={sxTd} align="center">
											<IconButton color="error" onClick={() => handleDelete(row.id)}>
												<DeleteRoundedIcon />
											</IconButton>
										</TableCell>
									</>
								)}
							</TableRow>
						))}
						{emptyRows > 0 && (
							<TableRow style={{ height: 27 * emptyRows }}>
								<TableCell colSpan={totalCols} />
							</TableRow>
						)}
					</TableBody>

					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[3, 5, 10, 25, { label: "All", value: -1 }]}
								colSpan={totalCols}
								count={filteredRows.length}
								rowsPerPage={rowsPerPage}
								page={page}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
								ActionsComponent={TablePaginationActions}
								sx={{ height: 15, py: 0.75 }}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default EventLog;
