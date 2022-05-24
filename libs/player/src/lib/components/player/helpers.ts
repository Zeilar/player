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

export function formatProgress(player: HTMLVideoElement | null) {
	if (!player) {
		return undefined;
	}
	const percent = (player.currentTime / player.duration) * 100;
	return `${percent}%`;
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

export function skip(player: HTMLVideoElement | null, seconds: number) {
	if (!player) {
		return;
	}
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
