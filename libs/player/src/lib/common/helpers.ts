import { Icon } from "../types/icons";

export const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
	minimumIntegerDigits: 2,
});

export function clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

export function enterFullscreen(wrapperEl: HTMLDivElement | null) {
	wrapperEl?.requestFullscreen();
}

export function getScrubberPercentage(
	e: React.MouseEvent | MouseEvent,
	timelineEl: HTMLElement | null
) {
	if (!timelineEl) {
		return 0;
	}
	const timelineElRect = timelineEl.getBoundingClientRect();
	return (
		clamp(0, e.clientX - timelineElRect.x, timelineElRect.width) /
		timelineElRect.width
	);
}

export function formatProgress(progress: number) {
	const seconds = Math.floor(progress % 60);
	const minutes = Math.floor((progress / 60) % 60);
	const hours = Math.floor(progress / 3600);
	return hours === 0
		? `${minutes}:${leadingZeroFormatter.format(seconds)}`
		: `${hours}:${leadingZeroFormatter.format(
				minutes
		  )}:${leadingZeroFormatter.format(seconds)}`;
}

export function exitFullscreen() {
	document.exitFullscreen();
}

export function toggleFullscreen(wrapperEl: HTMLDivElement | null) {
	if (document.fullscreenElement) {
		exitFullscreen();
	} else {
		enterFullscreen(wrapperEl);
	}
}

export function getVolumeIcon(volume: number): Icon {
	if (volume === 0) {
		return "VolumeOff";
	}
	return volume >= 0.5 ? "VolumeUp" : "VolumeDown";
}
