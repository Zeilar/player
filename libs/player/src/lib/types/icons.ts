export type Icon =
	| "FullscreenExit"
	| "FullscreenOpen"
	| "Pause"
	| "Play"
	| "Replay"
	| "VolumeDown"
	| "VolumeUp"
	| "VolumeOff"
	| "Subtitles"
	| "HD";

export type IconComponent = React.FunctionComponent<
	React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	}
>;

export interface MenuItem {
	label: string;
	active: boolean;
	onClick(): void;
}
