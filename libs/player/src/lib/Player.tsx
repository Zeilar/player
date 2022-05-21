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
	const player = useRef<HTMLVideoElement>(null);
	const timeline = useRef<HTMLDivElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);

	console.log({ isPlaying });

	useEffect(() => {
		if (!player.current) {
			return;
		}
		setIsPlaying(!player.current.paused);
	}, []);

	function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
		const element = e.target as HTMLVideoElement;
		setProgress(element.currentTime);
	}

	function play() {
		if (!player.current) {
			return;
		}
		player.current.play();
	}

	function pause() {
		if (!player.current) {
			return;
		}
		player.current.pause();
	}

	function updateTimeline(e: React.MouseEvent | MouseEvent) {
		if (!player.current || !timeline.current) {
			return;
		}
		const rect = timeline.current.getBoundingClientRect();
		const percent =
			Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
		const progress = player.current.duration * percent;
		player.current.currentTime = progress;
		setProgress(progress);
	}

	function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsScrubbing(true);
		updateTimeline(e);
	}

	function togglePlay() {
		if (!player.current) {
			return;
		}
		if (player.current.paused) {
			player.current.play();
		} else {
			player.current.pause();
		}
	}

	function onPlayHandler() {
		setIsEnded(false);
		setIsPlaying(true);
	}

	useEffect(() => {
		function mouseMoveHandler(e: MouseEvent) {
			e.preventDefault();
			if (!player.current || !isScrubbing) {
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
		return player.current
			? `${(player.current.currentTime / player.current.duration) * 100}%`
			: undefined;
	}

	return (
		<div className="AngelinPlayer" data-paused={!isPlaying}>
			{player.current && !isPlaying && (
				<svg
					className="AngelinPlayer__big-resume-icon"
					viewBox="0 0 24 24"
				>
					<path d="M8 5v14l11-7z"></path>
				</svg>
			)}
			<div className="AngelinPlayer__controls">
				{player.current && isLoaded && (
					<div
						className="AngelinPlayer__timeline"
						ref={timeline}
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
				ref={player}
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
