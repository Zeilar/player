import "@fontsource/fira-sans";
import "../../styles/player.scss";
import { useRef, useState, useEffect, useCallback } from "react";
import { PlayerCaptions, PlayerQuality } from "../../types/player";
import { PlayerControls } from "../PlayerControls";
import { useVideo } from "../../hooks/useVideo";
import {
	clamp,
	enterFullscreen,
	getScrubberPercentage,
	toggleFullscreen,
} from "../../common/helpers";

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
	const videoEl = useRef<HTMLVideoElement>(null);
	const [state, controller] = useVideo(videoEl);

	const prevCaptions = useRef<number | null>(null);
	const tooltipEl = useRef<HTMLSpanElement>(null);
	const wrapperEl = useRef<HTMLDivElement>(null);
	const timelineEl = useRef<HTMLDivElement>(null);
	const controlsEl = useRef<HTMLDivElement>(null);

	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubberTooltipCss, setScrubberTooltipCss] =
		useState<React.CSSProperties>({});
	const [currentQualityId, setCurrentQualityId] = useState<number>(
		qualities[0].id
	);
	const [activeCaptionsIndex, setActiveCaptionsIndex] = useState<
		number | null
	>(null);

	function changeQuality(id: number) {
		setCurrentQualityId(id);
		if (currentQualityId !== id) {
			controller.reset();
		}
	}

	const positionScrubberTooltip = useCallback(
		(percent: number) => {
			if (!tooltipEl.current || !videoEl.current || !timelineEl.current) {
				return;
			}
			const tooltipElRect = tooltipEl.current.getBoundingClientRect();
			const videoElRect = videoEl.current.getBoundingClientRect();
			const timelineElRect = timelineEl.current.getBoundingClientRect();
			const width = state.progress >= 60 * 60 ? 50 : 40;
			const left = clamp(
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
		[state.progress]
	);

	const updateTimeline = useCallback(
		(e: React.MouseEvent | MouseEvent) => {
			if (!videoEl.current || !timelineEl.current) {
				return;
			}
			const percent = getScrubberPercentage(e, timelineEl.current);
			const progress = videoEl.current.duration * percent;
			videoEl.current.currentTime = progress;
			controller.setProgress(progress); // Need this, otherwise the number only updates after video has loaded the new progress
			positionScrubberTooltip(percent);
		},
		[positionScrubberTooltip, controller]
	);

	function toggleCaptions() {
		setActiveCaptionsIndex(
			typeof activeCaptionsIndex === "number"
				? null
				: prevCaptions.current ?? 0
		);
	}

	function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.buttons !== 1) {
			return;
		}
		e.preventDefault();
		setIsScrubbing(true);
		updateTimeline(e);
	}

	function orderSources() {
		const qualitiesCopy = [...qualities];
		const indexOfActive = qualitiesCopy.findIndex(
			quality => quality.id === currentQualityId
		);
		const active = qualitiesCopy.splice(indexOfActive, 1);
		return [...active, ...qualitiesCopy];
	}

	useEffect(() => {
		function customContextMenu(e: MouseEvent) {
			if (!wrapperEl.current || !controlsEl.current) {
				return;
			}
			if (wrapperEl.current.contains(e.target as HTMLElement)) {
				e.preventDefault();
			}
		}
		document.addEventListener("contextmenu", customContextMenu);
		return () => {
			document.removeEventListener("contextmenu", customContextMenu);
		};
	}, []);

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
		function scrub(e: MouseEvent) {
			if (!videoEl.current || !isScrubbing) {
				return;
			}
			e.preventDefault();
			updateTimeline(e);
		}

		function stopScrubbing(e: MouseEvent) {
			if (!isScrubbing) {
				return;
			}
			e.preventDefault();
			setIsScrubbing(false);
			setScrubberTooltipCss({});
		}

		document.addEventListener("mousemove", scrub);
		document.addEventListener("mouseup", stopScrubbing);

		return () => {
			document.removeEventListener("mousemove", scrub);
			document.removeEventListener("mouseup", stopScrubbing);
		};
	}, [isScrubbing, updateTimeline]);

	function shortcutHandler(e: React.KeyboardEvent) {
		if (!videoEl.current) {
			return;
		}
		console.log(e.key);
		e.stopPropagation();
		switch (e.key) {
			case "Home":
				controller.goToStart();
				break;
			case "End":
				controller.goToEnd();
				break;
			case "c":
				toggleCaptions();
				break;
			case "f":
				toggleFullscreen(wrapperEl.current);
				break;
			case " ":
				e.preventDefault();
				controller.togglePlaying();
				break;
			case "ArrowRight":
				controller.skip(5);
				break;
			case "ArrowLeft":
				controller.skip(-5);
				break;
			case "ArrowUp":
				controller.bumpVolume(0.05);
				break;
			case "ArrowDown":
				controller.bumpVolume(-0.05);
				break;
			case "m":
				controller.toggleMute();
				break;
		}
	}

	return (
		<div
			className="AngelinPlayer"
			data-player
			data-paused={state.isPlaying === false}
			ref={wrapperEl}
			tabIndex={1}
			onKeyDown={shortcutHandler}
		>
			<span
				className="AngelinPlayer__progress-tooltip"
				ref={tooltipEl}
				style={scrubberTooltipCss}
			>
				{state.formattedProgress}
			</span>
			<PlayerControls
				state={state}
				controller={controller}
				controlsEl={controlsEl}
				timelineEl={timelineEl}
				changeCaptions={index => setActiveCaptionsIndex(index)}
				enterFullscreen={() => enterFullscreen(wrapperEl.current)}
				onTimelineClick={onTimelineClick}
				captions={captions}
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
