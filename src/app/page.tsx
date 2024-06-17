"use client";

import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
	useQuery,
	useMutation,
	useQueryClient,
	QueryClient,
	QueryClientProvider,
	type UseQueryResult,
	type UseMutationResult,
} from "@tanstack/react-query";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import GridControls from "./components/GridControls";
import Grid from "./components/Grid";
import "./globals.css";

type Cell = {
	row: number;
	column: number;
	isActive: boolean;
	key: string;
};

const queryClient = new QueryClient();

const fetchCells = async (): Promise<Cell[]> => {
	const response = await axios.get<Cell[]>("/api/cells");
	return response.data;
};

const updateCell = async (cell: {
	row: number;
	column: number;
	isActive: boolean;
}): Promise<void> => {
	await axios.post("/api/update", cell);
};

const HomeComponent: React.FC = () => {
	const gridSize = 10;
	const [hoveredCell, setHoveredCell] = useState<{
		row: number;
		column: number;
	} | null>(null);
	const [activeColor, setActiveColor] = useState<string>("#000000");
	const [clickOrder, setClickOrder] = useState<
		Array<{ row: number; column: number }>
	>([]);

	const queryClient = useQueryClient();

	const {
		data: cells = [],
		isLoading,
		isError,
		error,
	}: UseQueryResult<Cell[], Error> = useQuery<Cell[], Error>({
		queryKey: ["cells"],
		queryFn: fetchCells,
	});

	const mutation: UseMutationResult<
		void,
		Error,
		{ row: number; column: number; isActive: boolean }
	> = useMutation({
		mutationFn: updateCell,
		onMutate: async (newCell) => {
			await queryClient.cancelQueries({ queryKey: ["cells"] });

			const previousCells = queryClient.getQueryData<Cell[]>(["cells"]);

			if (previousCells) {
				queryClient.setQueryData<Cell[]>(["cells"], (oldCells) =>
					oldCells?.map((cell) =>
						cell.row === newCell.row && cell.column === newCell.column
							? { ...cell, isActive: newCell.isActive }
							: cell,
					),
				);
			}

			return { previousCells };
		},
		onError: (err, newCell, context) => {
			if (context?.previousCells) {
				queryClient.setQueryData<Cell[]>(["cells"], context.previousCells);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["cells"] });
		},
	});

	const createInitialCells = useCallback((data: Cell[]): Cell[] => {
		const initialCells: Cell[] = [];
		for (let row = 0; row < gridSize; row++) {
			for (let column = 0; column < gridSize; column++) {
				const cell = data.find((c) => c.row === row && c.column === column) || {
					row,
					column,
					isActive: false,
					key: `${row}-${column}`,
				};
				initialCells.push(cell);
			}
		}
		return initialCells;
	}, []);

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

			setClickOrder((prevOrder) => [...prevOrder, { row, column }]);
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

	const handleReset = useCallback(() => {
		for (const cell of clickOrder) {
			mutation.mutate({
				row: cell.row,
				column: cell.column,
				isActive: false,
			});
		}
		setClickOrder([]);
	}, [clickOrder, mutation]);

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
						handleReset={handleReset}
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
