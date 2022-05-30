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

export type BufferRange = [number, number]; // Numbers are in

export enum PlayerState {
	EMPTY = 0,
	IDLE = 1,
	LOADING = 2,
	NO_SRC = 3,
}
