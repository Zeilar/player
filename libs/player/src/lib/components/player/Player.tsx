import "../../styles/player.scss";
import { useRef, useState, useEffect } from "react";
import { PlayerSrc } from "../../types/player";
import { PlayerControls } from "../PlayerControls";
import * as helpers from "./helpers";

export interface PlayerProps {
	src: PlayerSrc;
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
	const [activeSrc, setActiveSrc] = useState<keyof PlayerSrc>("default");
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		setIsPlaying(!videoEl.current.paused);
	}, []);

	function changeSrc(src: number) {
		setActiveSrc(src);
	}

	function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
		const element = e.target as HTMLVideoElement;
		setProgress(element.currentTime);
	}

	function updateTimeline(e: React.MouseEvent | MouseEvent) {
		if (!videoEl.current || !timelineEl.current) {
			return;
		}
		const { x, width } = timelineEl.current.getBoundingClientRect();
		const percent = Math.min(Math.max(0, e.clientX - x), width) / width;
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
				helpers.toggleFullscreen(wrapperEl.current);
				break;
			case " ":
				e.preventDefault();
				helpers.togglePlay(videoEl.current);
				break;
			case "ArrowRight":
				helpers.skip(videoEl.current, 5);
				break;
			case "ArrowLeft":
				helpers.skip(videoEl.current, -5);
				break;
			case "ArrowUp":
				helpers.bumpVolume(videoEl.current, "up");
				break;
			case "ArrowDown":
				helpers.bumpVolume(videoEl.current, "down");
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
				onEnterFullscreen={() =>
					helpers.enterFullscreen(wrapperEl.current)
				}
				onExitFullscreen={helpers.exitFullscreen}
				onToggleMute={() => setIsMuted(p => !p)}
				onPause={() => helpers.pause(videoEl.current)}
				onPlay={() => helpers.play(videoEl.current)}
				onTimelineClick={onTimelineClick}
				progress={progress}
				progressPercent={helpers.formatProgress(videoEl.current)}
				src={src}
				activeSrc={activeSrc}
				changeSrc={changeSrc}
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
				onClick={() => helpers.togglePlay(videoEl.current)}
				onTimeUpdate={onTimeUpdate}
			>
				{src && <source src={src[activeSrc]} />}
				{track && <track src={track} />}
			</video>
		</div>
	);
}
