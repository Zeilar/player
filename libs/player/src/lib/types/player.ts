export interface PlayerSrc {
	default: string;
	[key: number]: string;
}

export interface PlayerCaptions {
	language: string;
	src: string;
}
