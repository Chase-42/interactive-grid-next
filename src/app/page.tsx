"use client";

import type React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import GridControls from "./components/GridControls";
import Grid from "./components/Grid";
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
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [activeColor, setActiveColor] = useState<string>("#000000");

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
				c.row === row && c.column === column ? { ...c, isActive } : c,
			);
			if (!cell) {
				updatedCells.push({ row, column, isActive, key: `${row}-${column}` });
			}
			setCells(updatedCells);

			try {
				await axios.post("/api/update", { row, column, isActive });
			} catch (error) {
				setError("Error updating cell on the server.");
			}
		},
		[cells],
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

	const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setActiveColor(event.target.value);
	};

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
						style={{ backgroundColor: cell.isActive ? activeColor : "#d3d3d3" }}
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
			activeColor,
		],
	);

	return (
		<div className="container">
			{error && <ErrorMessage message={error} />}
			{loading && <LoadingSpinner />}
			{!loading && !error && (
				<>
					<GridControls
						activeColor={activeColor}
						handleColorChange={handleColorChange}
					/>
					<Grid grid={grid} />
				</>
			)}
		</div>
	);
};

export default Home;
