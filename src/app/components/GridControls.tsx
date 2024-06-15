const GridControls = ({
	activeColor,
	handleColorChange,
}: {
	activeColor: string;
	handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
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
	</div>
);

export default GridControls;
