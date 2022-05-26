export interface PlayerSrc {
	default: string;
	[key: string]: string;
}

export interface PlayerCaptions {
	label: string;
	language: string;
	src: string;
}
