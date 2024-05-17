"use client";

import type React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./globals.css";

interface Cell {
	row: number;
	column: number;
	isActive: boolean;
	key: string;
}

interface HoveredCell {
	row: number;
	column: number;
}

function App() {
	const gridSize = 10;
	const [cells, setCells] = useState<Cell[]>([]);
	const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get("/api/cells");
				console.log("Fetched cells from the server:", response.data);
				setCells(createInitialCells(response.data));
			} catch (error) {
				console.error("Error fetching cells:", error);
				setError("Failed to load cells from the server.");
			}
		};

		fetchData();
	}, []);

	const createInitialCells = (
		data: { row: number; column: number; isActive: boolean }[],
	): Cell[] => {
		const initialCells: Cell[] = [];
		for (let row = 0; row < gridSize; row++) {
			for (let column = 0; column < gridSize; column++) {
				const cell = data.find((c) => c.row === row && c.column === column) || {
					row,
					column,
					isActive: false,
				};
				initialCells.push({ ...cell, key: `${row}-${column}` });
			}
		}
		return initialCells;
	};

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
				await axios.post("/api/update", {
					row,
					column,
					isActive,
				});
				console.log("Cell updated successfully on the server.");
			} catch (error) {
				console.error("Error updating cell:", error);
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
		(
			event: React.KeyboardEvent<HTMLDivElement>,
			row: number,
			column: number,
		) => {
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
						onKeyDown={(event) => handleKeyPress(event, cell.row, cell.column)}
						role="button"
						tabIndex={0}
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
		],
	);

	return (
		<div className="grid">
			{error && <div className="error">{error}</div>}
			{grid}
		</div>
	);
}

export default App;
