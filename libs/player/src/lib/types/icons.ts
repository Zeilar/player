export type Icon =
	| "FullscreenExit"
	| "FullscreenOpen"
	| "Pause"
	| "Play"
	| "Replay"
	| "VolumeDown"
	| "VolumeUp"
	| "VolumeOff"
	| "Subtitles";

export type IconComponent = React.FunctionComponent<
	React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	}
>;
