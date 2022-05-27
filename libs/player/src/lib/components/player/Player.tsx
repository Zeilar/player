import "@fontsource/fira-sans";
import "../../styles/player.scss";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { PlayerCaptions, PlayerQuality } from "../../types/player";
import { PlayerControls } from "../PlayerControls";
import * as helpers from "./helpers";

export interface PlayerProps {
	qualities: PlayerQuality[];
	captions?: PlayerCaptions[];
	controls?: boolean;
	aspectRatio?: string;
	autoplay?: boolean;
}

export function Player({
	aspectRatio,
	qualities,
	controls,
	captions = [],
	autoplay,
}: PlayerProps) {
	const prevVolume = useRef<number>(0.5);
	const prevCaptions = useRef<number | null>(null);
	const tooltipEl = useRef<HTMLSpanElement>(null);
	const wrapperEl = useRef<HTMLDivElement>(null);
	const videoEl = useRef<HTMLVideoElement>(null);
	const timelineEl = useRef<HTMLDivElement>(null);
	const controlsEl = useRef<HTMLDivElement>(null);
	const [duration, setDuration] = useState<number>(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [scrubberTooltipCss, setScrubberTooltipCss] =
		useState<React.CSSProperties>({});
	const [currentQualityId, setcurrentQualityId] = useState<number>(
		qualities[0].id
	);
	const [activeCaptionsIndex, setActiveCaptionsIndex] = useState<
		number | null
	>(null);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState<number>(0.5);
	const formattedProgress = useMemo(
		() => helpers.formatProgress(progress),
		[progress]
	);
	const formattedDuration = useMemo(
		() => helpers.formatProgress(duration),
		[duration]
	);

	useEffect(() => {
		if (!videoEl.current) {
			return;
		}
		setIsPlaying(!videoEl.current.paused);
	}, []);

	function changeQuality(id: number) {
		setcurrentQualityId(id);
		if (currentQualityId !== id) {
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

	const positionScrubberTooltip = useCallback(
		(percent: number) => {
			if (!tooltipEl.current || !videoEl.current || !timelineEl.current) {
				return;
			}
			const tooltipElRect = tooltipEl.current.getBoundingClientRect();
			const videoElRect = videoEl.current.getBoundingClientRect();
			const timelineElRect = timelineEl.current.getBoundingClientRect();
			const width = progress >= 60 * 60 ? 50 : 40;
			const left = helpers.clamp(
				videoElRect.width * percent - width / 2,
				videoElRect.x - 10,
				videoElRect.width - width - 10
			);
			setScrubberTooltipCss({
				top: timelineElRect.top - tooltipElRect.height - 5,
				left,
				width,
			});
		},
		[progress]
	);

	const updateTimeline = useCallback(
		(e: React.MouseEvent | MouseEvent) => {
			if (!videoEl.current || !timelineEl.current) {
				return;
			}
			const percent = helpers.getScrubberPercentage(
				e,
				timelineEl.current
			);
			const progress = videoEl.current.duration * percent;
			videoEl.current.currentTime = progress;
			setProgress(progress);
			positionScrubberTooltip(percent);
		},
		[positionScrubberTooltip]
	);

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
		const qualitiesCopy = [...qualities];
		const indexOfActive = qualitiesCopy.findIndex(
			quality => quality.id === currentQualityId
		);
		const active = qualitiesCopy.splice(indexOfActive, 1);
		return [...active, ...qualitiesCopy];
	}

	function onLoadedData(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
		setIsLoaded(true);
		setDuration(e.currentTarget.duration);
	}

	useEffect(() => {
		if (
			!videoEl.current ||
			progress < duration ||
			isNaN(videoEl.current.duration)
		) {
			return;
		}
		setIsEnded(true);
	}, [progress, duration]);

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
	}, [currentQualityId]);

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
			setScrubberTooltipCss({});
		}
		document.addEventListener("mousemove", mouseMoveHandler);
		document.addEventListener("mouseup", scrubHandler);
		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
			document.removeEventListener("mouseup", scrubHandler);
		};
	}, [isScrubbing, updateTimeline]);

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
			data-player
			data-paused={videoEl.current?.paused === true}
			ref={wrapperEl}
			tabIndex={1}
			onKeyDown={keyShortcutHandler}
		>
			<span
				className="AngelinPlayer__timeline-track__progress__tooltip"
				ref={tooltipEl}
				style={scrubberTooltipCss}
			>
				{formattedProgress}
			</span>
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
				onRestart={() => helpers.restart(videoEl.current)}
				onTimelineClick={onTimelineClick}
				volume={isMuted ? prevVolume.current : volume}
				captions={captions}
				formattedDuration={formattedDuration}
				formattedProgress={formattedProgress}
				progressPercent={helpers.formatProgressPercent(videoEl.current)}
				qualities={qualities}
				activeCaptionsIndex={activeCaptionsIndex}
				currentQualityId={currentQualityId}
				changeQuality={changeQuality}
			/>
			<video
				className="AngelinPlayer__video"
				style={{ aspectRatio }}
				ref={videoEl}
				autoPlay={autoplay}
				controls={controls}
				onPlay={onPlay}
				onVolumeChange={onVolumeChange}
				onLoadedData={onLoadedData}
				onPause={() => setIsPlaying(false)}
				onEnded={() => setIsEnded(true)}
				onClick={() => helpers.togglePlay(videoEl.current)}
				onTimeUpdate={onTimeUpdate}
			>
				{orderSources().map((quality, i) => (
					<source
						key={i}
						src={quality.src}
						data-label={quality}
						data-active={quality.id === currentQualityId}
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
