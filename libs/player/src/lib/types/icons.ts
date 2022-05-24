export type Icon =
	| "FullscreenExit"
	| "FullscreenOpen"
	| "Pause"
	| "Play"
	| "Replay"
	| "VolumeDown"
	| "VolumeUp"
	| "VolumeOff";

export type IconComponent = React.FunctionComponent<
	React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	}
>;
