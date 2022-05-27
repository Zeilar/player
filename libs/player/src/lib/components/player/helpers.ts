export const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
	minimumIntegerDigits: 2,
});

export function clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

export function play(player: HTMLVideoElement | null) {
	player?.play();
}

export function pause(player: HTMLVideoElement | null) {
	player?.pause();
}

export function enterFullscreen(wrapperEl: HTMLDivElement | null) {
	wrapperEl?.requestFullscreen();
}

export function formatProgressPercent(player: HTMLVideoElement | null) {
	if (!player) {
		return undefined;
	}
	const percent = (player.currentTime / player.duration) * 100;
	return `${percent}%`;
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

export function skip(player: HTMLVideoElement, seconds: number) {
	player.currentTime += seconds;
}

export function bumpVolume(
	player: HTMLVideoElement | null,
	direction: "up" | "down"
) {
	if (!player) {
		return;
	}
	const n = direction === "down" ? -0.05 : 0.05;
	const clamped = clamp(player.volume + n, 0, 1);
	player.volume = Math.round(clamped * 100) / 100;
}

export function togglePlay(player: HTMLVideoElement | null) {
	if (!player) {
		return;
	}
	if (player.paused) {
		player.play();
	} else {
		player.pause();
	}
}
