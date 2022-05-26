import "@fontsource/fira-sans";
import "../../styles/player.scss";
import { useRef, useState, useEffect } from "react";
import { PlayerCaptions, PlayerSrc } from "../../types/player";
import { PlayerControls } from "../PlayerControls";
import * as helpers from "./helpers";

export interface PlayerProps {
	src: PlayerSrc;
	captions?: PlayerCaptions[];
	controls?: boolean;
	aspectRatio?: string;
	autoplay?: boolean;
}

export function Player({
	aspectRatio,
	src,
	controls,
	captions = [],
	autoplay,
}: PlayerProps) {
	const prevVolume = useRef<number>(0.5);
	const prevCaptions = useRef<number | null>(null);
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
	const [activeSrc, setActiveSrc] = useState<keyof PlayerSrc>("Default");
	const [activeCaptionsIndex, setActiveCaptionsIndex] = useState<
		number | null
	>(null);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState<number>(0.5);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		setIsPlaying(!videoEl.current.paused);
	}, []);

	function changeSrc(src: keyof PlayerSrc) {
		setActiveSrc(src);
		if (src !== activeSrc) {
			setIsPlaying(false);
			setIsLoaded(false);
		}
	}

	function onVolumeChange(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
		prevVolume.current = isMuted ? volume : e.currentTarget.volume;
		setVolume(e.currentTarget.volume);
	}

	function onVolumeInputChange(volume: number) {
		if (!videoEl.current) {
			return;
		}
		videoEl.current.volume = volume;
		setIsMuted(false);
	}

	function onMute() {
		if (!videoEl.current) {
			return;
		}
		setIsMuted(true);
	}

	function onUnmute() {
		if (!videoEl.current) {
			return;
		}
		setIsMuted(false);
	}

	function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
		if (isScrubbing || !e.currentTarget) {
			return;
		}
		setProgress(e.currentTarget.currentTime);
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

	function onCaptionsToggle() {
		setActiveCaptionsIndex(
			typeof activeCaptionsIndex === "number"
				? null
				: prevCaptions.current ?? 0
		);
	}

	function onCaptionsChange(index: number | null) {
		setActiveCaptionsIndex(index);
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

	function orderSources() {
		const srcs = Object.keys(src) as (keyof PlayerSrc)[];
		const indexOfActive = srcs.indexOf(activeSrc);
		const active = srcs.splice(indexOfActive, 1);
		return [...active, ...srcs];
	}

	useEffect(() => {
		function fullscreenHandler() {
			setIsFullscreen(Boolean(document.fullscreenElement));
		}
		function customContextMenu(e: MouseEvent) {
			if (!wrapperEl.current || !controlsEl.current) {
				return;
			}
			if (wrapperEl.current.contains(e.target as HTMLElement)) {
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
		if (!videoEl.current) {
			return;
		}
		videoEl.current.volume = isMuted ? 0 : prevVolume.current;
	}, [isMuted]);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		if (activeCaptionsIndex !== null) {
			prevCaptions.current = activeCaptionsIndex;
		}
		const { textTracks } = videoEl.current;
		for (let i = 0; i < textTracks.length; i++) {
			textTracks[i].mode =
				i === activeCaptionsIndex ? "showing" : "disabled";
		}
	}, [activeCaptionsIndex]);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		const source = videoEl.current.querySelector(
			'source[data-active="true"]'
		);
		if (!source) {
			return;
		}
		const { currentTime } = videoEl.current;
		videoEl.current.load();
		videoEl.current.currentTime = currentTime;
	}, [activeSrc]);

	useEffect(() => {
		function mouseMoveHandler(e: MouseEvent) {
			if (!videoEl.current || !isScrubbing) {
				return;
			}
			e.preventDefault();
			updateTimeline(e);
		}
		function scrubHandler(e: MouseEvent) {
			if (!isScrubbing) {
				return;
			}
			e.preventDefault();
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
			case "Home":
				videoEl.current.currentTime = 0;
				break;
			case "End":
				videoEl.current.currentTime = videoEl.current.duration;
				break;
			case "c":
				onCaptionsToggle();
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
				if (isMuted) {
					const volume = helpers.clamp(
						prevVolume.current + 0.05,
						0,
						1
					);
					prevVolume.current = volume;
					setVolume(volume);
				} else {
					helpers.bumpVolume(videoEl.current, "up");
				}
				break;
			case "ArrowDown":
				if (isMuted) {
					const volume = helpers.clamp(
						prevVolume.current - 0.05,
						0,
						1
					);
					prevVolume.current = volume;
					setVolume(volume);
				} else {
					helpers.bumpVolume(videoEl.current, "down");
				}
				break;
			case "m":
				isMuted ? onUnmute() : onMute();
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
				isMuted={isMuted}
				onCaptionsToggle={onCaptionsToggle}
				onCaptionsChange={onCaptionsChange}
				onEnterFullscreen={() =>
					helpers.enterFullscreen(wrapperEl.current)
				}
				onExitFullscreen={helpers.exitFullscreen}
				onMute={onMute}
				onUnmute={onUnmute}
				onVolumeChange={onVolumeInputChange}
				onPause={() => helpers.pause(videoEl.current)}
				onPlay={() => helpers.play(videoEl.current)}
				onTimelineClick={onTimelineClick}
				volume={isMuted ? prevVolume.current : volume}
				progress={progress}
				captions={captions}
				progressPercent={helpers.formatProgress(videoEl.current)}
				src={src}
				activeCaptionsIndex={activeCaptionsIndex}
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
				onLoad={() => console.log("loaded")}
				onVolumeChange={onVolumeChange}
				onLoadedData={() => setIsLoaded(true)}
				onPause={() => setIsPlaying(false)}
				onEnded={() => setIsEnded(true)}
				onClick={() => helpers.togglePlay(videoEl.current)}
				onTimeUpdate={onTimeUpdate}
			>
				{orderSources().map((key, i) => (
					<source
						key={i}
						src={src[key]}
						data-label={key}
						data-active={key === activeSrc}
					/>
				))}
				{captions.map((caption, i) => (
					<track
						key={i}
						kind="captions"
						srcLang={caption.language}
						src={caption.src}
					/>
				))}
			</video>
		</div>
	);
}
