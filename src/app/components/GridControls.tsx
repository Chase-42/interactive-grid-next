interface GridControlsProps {
	activeColor: string;
	handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleReset: () => void;
}

const GridControls: React.FC<GridControlsProps> = ({
	activeColor,
	handleColorChange,
	handleReset,
}) => {
	return (
		<div className="controls">
			<label className="color-label" htmlFor="colorPicker">
				Active Cell Color:
			</label>
			<input
				id="colorPicker"
				className="color-picker"
				type="color"
				value={activeColor}
				onChange={handleColorChange}
			/>
			<button className="reset-button" onClick={handleReset} type="button">
				Reset Grid
			</button>
		</div>
	);
};

export default GridControls;
