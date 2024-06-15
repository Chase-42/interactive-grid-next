"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
	useQuery,
	useMutation,
	useQueryClient,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import GridControls from "./components/GridControls";
import Grid from "./components/Grid";
import "./globals.css";

// Create a query client
const queryClient = new QueryClient();

const fetchCells = async () => {
	const response = await axios.get("/api/cells");
	return response.data;
};

const updateCell = async (cell: {
	row: number;
	column: number;
	isActive: boolean;
}) => {
	await axios.post("/api/update", cell);
};

const HomeComponent: React.FC = () => {
	const gridSize = 10;
	const [hoveredCell, setHoveredCell] = useState<{
		row: number;
		column: number;
	} | null>(null);
	const [activeColor, setActiveColor] = useState<string>("#000000");

	const queryClient = useQueryClient();

	const {
		data: cells = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["cells"],
		queryFn: fetchCells,
	});

	const mutation = useMutation({
		mutationFn: updateCell,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cells"] });
		},
	});

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

	const initialCells = useMemo(
		() => createInitialCells(cells),
		[cells, createInitialCells],
	);

	const toggleCell = useCallback(
		(row: number, column: number) => {
			const cell = initialCells.find(
				(c) => c.row === row && c.column === column,
			);
			const isActive = cell ? !cell.isActive : true;
			mutation.mutate({ row, column, isActive });
		},
		[initialCells, mutation],
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
			initialCells.map((cell) => {
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
			initialCells,
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
			{isError && <ErrorMessage message={(error as Error).message} />}
			{isLoading && <LoadingSpinner />}
			{!isLoading && !isError && (
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

const Home = () => (
	<QueryClientProvider client={queryClient}>
		<HomeComponent />
	</QueryClientProvider>
);

export default Home;
