import React, { useRef, useState, useEffect } from "react";
import "./player.scss";

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
	const videoEl = useRef<HTMLVideoElement>(null);
	const timelineEl = useRef<HTMLDivElement>(null);
	const controlsEl = useRef<HTMLDivElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);

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

	function play() {
		if (!videoEl.current) {
			return;
		}
		videoEl.current.play();
	}

	function pause() {
		if (!videoEl.current) {
			return;
		}
		videoEl.current.pause();
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
		e.preventDefault();
		if (e.buttons !== 1) {
			return;
		}
		setIsScrubbing(true);
		updateTimeline(e);
	}

	function togglePlay() {
		if (!videoEl.current) {
			return;
		}
		if (videoEl.current.paused) {
			videoEl.current.play();
		} else {
			videoEl.current.pause();
		}
	}

	function onPlayHandler() {
		setIsEnded(false);
		setIsPlaying(true);
	}

	useEffect(() => {
		function customContextMenu(e: MouseEvent) {
			if (!videoEl.current || !controlsEl.current) {
				return;
			}
			const target = e.target as HTMLElement;
			if (
				videoEl.current.contains(target) ||
				controlsEl.current.contains(target)
			) {
				e.preventDefault();
			}
		}
		document.addEventListener("contextmenu", customContextMenu);
		return () => {
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
		document.addEventListener("mousemove", mouseMoveHandler);
		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
		};
	}, [isScrubbing]);

	useEffect(() => {
		function scrubHandler(e: MouseEvent) {
			e.preventDefault();
			if (!isScrubbing) {
				return;
			}
			setIsScrubbing(false);
		}
		document.addEventListener("mouseup", scrubHandler);
		return () => {
			document.removeEventListener("mouseup", scrubHandler);
		};
	}, [isScrubbing]);

	function getProgressPercent() {
		if (!videoEl.current) {
			return undefined;
		}
		const percent =
			(videoEl.current.currentTime / videoEl.current.duration) * 100;
		return `${percent}%`;
	}

	return (
		<div className="AngelinPlayer" data-paused={!isPlaying}>
			{videoEl.current && (
				<svg
					className="AngelinPlayer__big-resume-icon"
					viewBox="0 0 24 24"
					data-hidden={isPlaying}
				>
					<path d="M8 5v14l11-7z"></path>
				</svg>
			)}
			<div className="AngelinPlayer__controls" ref={controlsEl}>
				{videoEl.current && isLoaded && (
					<div
						className="AngelinPlayer__timeline"
						ref={timelineEl}
						onMouseDown={onTimelineClick}
					>
						<div className="AngelinPlayer__timeline-grabber" />
						<div
							className="AngelinPlayer__timeline-track"
							data-timeline-track
						>
							<div
								className="AngelinPlayer__timeline-track__progress"
								style={{ width: getProgressPercent() }}
							/>
						</div>
					</div>
				)}
				{isPlaying ? (
					<button
						className="AngelinPlayer__button"
						disabled={!isLoaded}
						onClick={pause}
					>
						<svg
							className="AngelinPlayer__icon"
							focusable="false"
							viewBox="0 0 24 24"
						>
							<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
						</svg>
					</button>
				) : (
					<button
						className="AngelinPlayer__button"
						disabled={!isLoaded}
						onClick={play}
					>
						{isEnded ? (
							<svg
								className="AngelinPlayer__icon"
								viewBox="0 0 24 24"
							>
								<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>
							</svg>
						) : (
							<svg
								className="AngelinPlayer__icon"
								viewBox="0 0 24 24"
							>
								<path d="M8 5v14l11-7z"></path>
							</svg>
						)}
					</button>
				)}
			</div>
			<video
				onLoadedData={() => setIsLoaded(true)}
				className="AngelinPlayer__video"
				style={{ aspectRatio }}
				ref={videoEl}
				autoPlay={autoplay}
				onPlay={onPlayHandler}
				onPause={() => setIsPlaying(false)}
				onEnded={() => setIsEnded(true)}
				onTimeUpdate={onTimeUpdate}
				onClick={togglePlay}
				controls={controls}
			>
				{src && <source src={src} />}
				{track && <track src={track} />}
			</video>
		</div>
	);
}
