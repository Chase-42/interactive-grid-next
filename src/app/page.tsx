"use client";
import type React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import "./globals.css";

const Home = () => {
	const gridSize = 10;
	const [cells, setCells] = useState<
		Array<{ row: number; column: number; isActive: boolean; key: string }>
	>([]);
	const [hoveredCell, setHoveredCell] = useState<{
		row: number;
		column: number;
	} | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [color, setColor] = useState<string>("#000000");

	const createInitialCells = useCallback(
		(data: Array<{ row: number; column: number; isActive: boolean }>) => {
			const initialCells = [];
			for (let row = 0; row < gridSize; row++) {
				for (let column = 0; column < gridSize; column++) {
					const cell = data.find(
						(c) => c.row === row && c.column === column,
					) || {
						row,
						column,
						isActive: false,
					};
					initialCells.push({ ...cell, key: `${row}-${column}` });
				}
			}
			return initialCells;
		},
		[],
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get("/api/cells");
				console.log("Fetched cells from the server:", response.data);
				setCells(createInitialCells(response.data));
			} catch (error) {
				console.error("Error fetching cells:", error);
				setError("Failed to load cells from the server.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [createInitialCells]);

	const toggleCell = useCallback(
		async (row: number, column: number) => {
			const cell = cells.find((c) => c.row === row && c.column === column);
			const isActive = cell ? !cell.isActive : true;

			const updatedCells = cells.map((c) =>
				c.row === row && c.column === column
					? { ...c, isActive, color: isActive ? color : "#d3d3d3" }
					: c,
			);
			if (!cell) {
				updatedCells.push({
					row,
					column,
					isActive,
					key: `${row}-${column}`,
					color: isActive ? color : "#d3d3d3",
				});
			}
			setCells(updatedCells);

			try {
				await axios.post("/api/update", {
					row,
					column,
					isActive,
					color: isActive ? color : "#d3d3d3",
				});
				console.log("Cell updated successfully on the server.");
			} catch (error) {
				console.error("Error updating cell:", error);
				setError("Error updating cell on the server.");
			}
		},
		[cells, color],
	);

	const handleMouseEnter = useCallback((row: number, column: number) => {
		setHoveredCell({ row, column });
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoveredCell(null);
	}, []);

	const handleKeyPress = useCallback(
		(event: React.KeyboardEvent, row: number, column: number) => {
			if (event.key === "Enter" || event.key === " ") {
				toggleCell(row, column);
			}
		},
		[toggleCell],
	);

	const grid = useMemo(
		() =>
			cells.map((cell) => {
				let className = `cell${cell.isActive ? " active" : ""}`;
				if (
					hoveredCell &&
					(hoveredCell.row === cell.row || hoveredCell.column === cell.column)
				) {
					className += " highlight";
					if (
						hoveredCell.row === cell.row &&
						hoveredCell.column === cell.column
					) {
						className += " main-highlight";
					}
				}
				return (
					<div
						key={cell.key}
						className={className}
						onClick={() => toggleCell(cell.row, cell.column)}
						onMouseEnter={() => handleMouseEnter(cell.row, cell.column)}
						onMouseLeave={handleMouseLeave}
						onKeyPress={(event) => handleKeyPress(event, cell.row, cell.column)}
						role="button"
						tabIndex={0}
						style={{ backgroundColor: cell.isActive ? color : "#d3d3d3" }}
					/>
				);
			}),
		[
			cells,
			hoveredCell,
			toggleCell,
			handleMouseEnter,
			handleMouseLeave,
			handleKeyPress,
			color,
		],
	);

	return (
		<div className="container">
			{loading ? (
				<div className="loading-container">
					<ClipLoader color={"#000000"} loading={loading} size={100} />
					<p>Loading cells...</p>
				</div>
			) : (
				<>
					<div className="controls">
						<label htmlFor="colorPicker" className="color-label">
							Pick Cell Color:
						</label>
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="color-picker"
						/>
					</div>
					<div className="grid">
						{error && <div className="error">{error}</div>}
						{grid}
					</div>
				</>
			)}
		</div>
	);
};

export default Home;
