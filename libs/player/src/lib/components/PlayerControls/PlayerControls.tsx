import { PlayerSrc } from "../../types/player";
import { IconButton } from "../IconButton";

export interface PlayerControlsProps {
	controlsEl: React.RefObject<HTMLDivElement>;
	timelineEl: React.RefObject<HTMLDivElement>;
	isPlaying: boolean;
	isEnded: boolean;
	isVideoLoaded: boolean;
	isFullscreen: boolean;
	progressPercent: string | undefined;
	progress: number;
	activeSrc: keyof PlayerSrc;
	src: PlayerSrc;
	onTimelineClick(e: React.MouseEvent<HTMLDivElement>): void;
	onPlay(): void;
	onPause(): void;
	onEnterFullscreen(): void;
	onExitFullscreen(): void;
	onToggleMute(): void;
	changeSrc(src: number): void;
	// onVolumeChange(): void
}

export function PlayerControls({
	controlsEl,
	isPlaying,
	isEnded,
	isFullscreen,
	isVideoLoaded,
	onTimelineClick,
	progress,
	progressPercent,
	timelineEl,
	onEnterFullscreen,
	onExitFullscreen,
	onToggleMute,
	onPause,
	onPlay,
	activeSrc,
	changeSrc,
	src,
}: PlayerControlsProps) {
	return (
		<>
			<svg
				className="AngelinPlayer__big-resume-icon"
				viewBox="0 0 24 24"
				data-hidden={isPlaying}
			>
				<path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"></path>
			</svg>
			<div className="AngelinPlayer__controls" ref={controlsEl}>
				<div
					className="AngelinPlayer__timeline"
					ref={timelineEl}
					onMouseDown={onTimelineClick}
				>
					<button className="AngelinPlayer__timeline-grabber" />
					<div
						className="AngelinPlayer__timeline-track"
						data-timeline-track
					>
						<div
							className="AngelinPlayer__timeline-track__progress"
							style={{ width: progressPercent }}
						/>
					</div>
				</div>
				<div className="AngelinPlayer__controls-buttons">
					{isPlaying ? (
						<IconButton
							disabled={!isVideoLoaded}
							onClick={onPause}
							icon="Pause"
						/>
					) : (
						<IconButton
							disabled={!isVideoLoaded}
							onClick={onPlay}
							icon={isEnded ? "Replay" : "Play"}
						/>
					)}
					{isFullscreen ? (
						<IconButton
							onClick={onExitFullscreen}
							icon="FullscreenExit"
						/>
					) : (
						<IconButton
							onClick={onEnterFullscreen}
							icon="FullscreenOpen"
						/>
					)}
				</div>
			</div>
		</>
	);
}
