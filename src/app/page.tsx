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
	clickedOrder: number;
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
	clickedOrder: number;
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
	const [clickOrder, setClickOrder] = useState<number>(1);

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
		{ row: number; column: number; isActive: boolean; clickedOrder: number }
	> = useMutation({
		mutationFn: updateCell,
		onMutate: async (newCell) => {
			await queryClient.cancelQueries({ queryKey: ["cells"] });

			const previousCells = queryClient.getQueryData<Cell[]>(["cells"]);

			if (previousCells) {
				queryClient.setQueryData<Cell[]>(["cells"], (oldCells) =>
					oldCells?.map((cell) =>
						cell.row === newCell.row && cell.column === newCell.column
							? {
									...cell,
									isActive: newCell.isActive,
									clickedOrder: newCell.clickedOrder,
								}
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
					clickedOrder: 0,
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
			if (!cell) return;

			const isActive = !cell.isActive;

			setClickOrder((prevOrder) => prevOrder + 1);
			mutation.mutate({ row, column, isActive, clickedOrder: isActive ? clickOrder : 0 });
		},
		[initialCells, mutation, clickOrder],
	);

	const handleMouseEnter = useCallback((row: number, column: number) => {
		console.log(`Hovering over cell: Row ${row}, Column ${column}`);
		setHoveredCell({ row, column });
	}, []);

	const handleMouseLeave = useCallback(() => {
		console.log("Mouse left cell");
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
		let delay = 0;
		for (const cell of cells
			.filter((cell) => cell.isActive)
			.sort((a, b) => a.clickedOrder - b.clickedOrder)) {
			setTimeout(() => {
				mutation.mutate({
					row: cell.row,
					column: cell.column,
					isActive: false,
					clickedOrder: 0,
				});
			}, delay);
			delay += 200; // Adjust the delay as needed
		}
		setClickOrder(1);
	}, [cells, mutation]);

	const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setActiveColor(event.target.value);
	};

	const grid = useMemo(
		() =>
			initialCells.map((cell) => {
				const className = [
					"cell",
					cell.isActive && "active",
					hoveredCell &&
					!cell.isActive &&
					(hoveredCell.row === cell.row || hoveredCell.column === cell.column) &&
					"highlight",
					hoveredCell &&
					hoveredCell.row === cell.row &&
					hoveredCell.column === cell.column &&
					"main-highlight"
				]
					.filter(Boolean)
					.join(" ");

				const style = {
					backgroundColor: cell.isActive
						? activeColor
						: hoveredCell &&
						  !cell.isActive &&
						  (hoveredCell.row === cell.row || hoveredCell.column === cell.column)
						? hoveredCell.row === cell.row && hoveredCell.column === cell.column
							? activeColor
							: `${activeColor}80` // 50% opacity
						: "#d3d3d3",
				};

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
						style={style}
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
