import { BufferRange } from "./player";

export type Float = number; // Just to make it more verbose that some things should take floats instead of integers.

export interface UseVideoOptions {
	initialVolume?: Float;
}

export interface UseVideoState {
	isPlaying: boolean;
	isLoaded: boolean;
	isEnded: boolean;
	duration: number;
	progress: number;
	isMuted: boolean;
	isFullscreen: boolean;
	volume: number;
	formattedProgress: string;
	formattedDuration: string;
	bufferRanges: BufferRange[];
}

export interface UseVideoController {
	play(): void;
	pause(): void;
	mute(): void;
	unmute(): void;
	toggleMute(): void;
	skip(seconds: number): void;
	bumpVolume(offset: Float): void;
	togglePlaying(): void;
	goToStart(): void;
	goToEnd(): void;
	reset(): void;
	restart(): void;
	setProgress(progress: number): void;
	changeVolume(volume: Float): void;
}
