import { useRef, useState, useEffect } from "react";
import "../../styles/player.scss";
import { PlayerControls } from "../PlayerControls";

function clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

function play(player: HTMLVideoElement | null) {
	player?.play();
}

function pause(player: HTMLVideoElement | null) {
	player?.pause();
}

function enterFullscreen(wrapperEl: HTMLDivElement | null) {
	wrapperEl?.requestFullscreen();
}

function formatProgress(player: HTMLVideoElement | null) {
	if (!player) {
		return undefined;
	}
	const percent = (player.currentTime / player.duration) * 100;
	return `${percent}%`;
}

function exitFullscreen() {
	document.exitFullscreen();
}

function toggleFullscreen(wrapperEl: HTMLDivElement | null) {
	if (document.fullscreenElement) {
		exitFullscreen();
	} else {
		enterFullscreen(wrapperEl);
	}
}

function skip(player: HTMLVideoElement | null, seconds: number) {
	if (!player) {
		return;
	}
	player.currentTime += seconds;
}

function togglePlay(player: HTMLVideoElement | null) {
	if (!player) {
		return;
	}
	if (player.paused) {
		player.play();
	} else {
		player.pause();
	}
}

export interface PlayerProps {
	src?: string;
	controls?: boolean;
	aspectRatio?: string;
	track?: string;
	autoplay?: boolean;
}

export function Player({
	aspectRatio,
	src,
	controls,
	track,
	autoplay,
}: PlayerProps) {
	const wrapperEl = useRef<HTMLDivElement>(null);
	const videoEl = useRef<HTMLVideoElement>(null);
	const timelineEl = useRef<HTMLDivElement>(null);
	const controlsEl = useRef<HTMLDivElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		setIsPlaying(!videoEl.current.paused);
	}, []);

	function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
		const element = e.target as HTMLVideoElement;
		setProgress(element.currentTime);
	}

	function updateTimeline(e: React.MouseEvent | MouseEvent) {
		if (!videoEl.current || !timelineEl.current) {
			return;
		}
		const rect = timelineEl.current.getBoundingClientRect();
		const percent =
			Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
		const progress = videoEl.current.duration * percent;
		videoEl.current.currentTime = progress;
		setProgress(progress);
	}

	function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.buttons !== 1) {
			return;
		}
		e.preventDefault();
		setIsScrubbing(true);
		updateTimeline(e);
	}

	function onPlay() {
		setIsEnded(false);
		setIsPlaying(true);
	}

	useEffect(() => {
		function fullscreenHandler() {
			setIsFullscreen(Boolean(document.fullscreenElement));
		}
		function customContextMenu(e: MouseEvent) {
			if (!wrapperEl.current || !controlsEl.current) {
				return;
			}
			const target = e.target as HTMLElement;
			if (wrapperEl.current.contains(target)) {
				e.preventDefault();
			}
		}
		document.addEventListener("fullscreenchange", fullscreenHandler);
		document.addEventListener("contextmenu", customContextMenu);
		return () => {
			document.removeEventListener("fullscreenchange", fullscreenHandler);
			document.removeEventListener("contextmenu", customContextMenu);
		};
	}, []);

	useEffect(() => {
		function mouseMoveHandler(e: MouseEvent) {
			e.preventDefault();
			if (!videoEl.current || !isScrubbing) {
				return;
			}
			updateTimeline(e);
		}
		function scrubHandler(e: MouseEvent) {
			e.preventDefault();
			if (!isScrubbing) {
				return;
			}
			setIsScrubbing(false);
		}
		document.addEventListener("mousemove", mouseMoveHandler);
		document.addEventListener("mouseup", scrubHandler);
		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
			document.removeEventListener("mouseup", scrubHandler);
		};
	}, [isScrubbing]);

	function keyShortcutHandler(e: React.KeyboardEvent) {
		if (!videoEl.current) {
			return;
		}
		console.log(e.key);
		e.stopPropagation();
		switch (e.key) {
			case "c":
				// toggleCaptions
				break;
			case "f":
				toggleFullscreen(wrapperEl.current);
				break;
			case " ":
				e.preventDefault();
				togglePlay(videoEl.current);
				break;
			case "ArrowRight":
				skip(videoEl.current, 5);
				break;
			case "ArrowLeft":
				skip(videoEl.current, -5);
				break;
			case "ArrowUp":
				videoEl.current.volume = clamp(
					videoEl.current.volume + 0.05,
					0,
					1
				);
				break;
			case "ArrowDown":
				videoEl.current.volume = clamp(
					videoEl.current.volume - 0.05,
					0,
					1
				);
				break;
			case "m":
				// mute
				setIsMuted(p => !p);
				break;
		}
	}

	return (
		<div
			className="AngelinPlayer"
			data-paused={videoEl.current?.paused === true}
			ref={wrapperEl}
			tabIndex={1}
			onKeyDown={keyShortcutHandler}
		>
			<PlayerControls
				controlsEl={controlsEl}
				timelineEl={timelineEl}
				isEnded={isEnded}
				isFullscreen={isFullscreen}
				isPlaying={isPlaying}
				isVideoLoaded={isLoaded}
				onEnterFullscreen={() => enterFullscreen(wrapperEl.current)}
				onExitFullscreen={exitFullscreen}
				onToggleMute={() => setIsMuted(p => !p)}
				onPause={() => pause(videoEl.current)}
				onPlay={() => play(videoEl.current)}
				onTimelineClick={onTimelineClick}
				progress={progress}
				progressPercent={formatProgress(videoEl.current)}
			/>
			<video
				className="AngelinPlayer__video"
				style={{ aspectRatio }}
				ref={videoEl}
				autoPlay={autoplay}
				controls={controls}
				onPlay={onPlay}
				onLoadedData={() => setIsLoaded(true)}
				onPause={() => setIsPlaying(false)}
				onEnded={() => setIsEnded(true)}
				onClick={() => togglePlay(videoEl.current)}
				onTimeUpdate={onTimeUpdate}
			>
				{src && <source src={src} />}
				{track && <track src={track} />}
			</video>
		</div>
	);
}
