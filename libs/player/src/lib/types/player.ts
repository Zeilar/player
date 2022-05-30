export interface PlayerQuality {
	label: string;
	src: string;
	id: number;
}

export interface PlayerCaptions {
	label: string;
	language: string;
	src: string;
}

export type BufferRange = [number, number]; // Numbers are in seconds
