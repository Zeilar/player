import { Icon, MenuItem } from "../../types/icons";
import { PlayerCaptions, PlayerSrc } from "../../types/player";
import { IconButton } from "../IconButton";

function getVolumeIcon(volume: number): Icon {
	if (volume === 0) {
		return "VolumeOff";
	}
	return volume >= 0.5 ? "VolumeUp" : "VolumeDown";
}

export interface PlayerControlsProps {
	controlsEl: React.RefObject<HTMLDivElement>;
	timelineEl: React.RefObject<HTMLDivElement>;
	isPlaying: boolean;
	isEnded: boolean;
	isMuted: boolean;
	isVideoLoaded: boolean;
	isFullscreen: boolean;
	progressPercent: string | undefined;
	progress: number;
	activeCaptionsIndex: number | null;
	activeSrc: keyof PlayerSrc;
	src: PlayerSrc;
	volume: number;
	captions?: PlayerCaptions[];
	onCaptionsToggle(): void;
	onCaptionsChange(index: number | null): void;
	onTimelineClick(e: React.MouseEvent<HTMLDivElement>): void;
	onPlay(): void;
	onPause(): void;
	onEnterFullscreen(): void;
	onExitFullscreen(): void;
	onVolumeChange(volume: number): void;
	onUnmute(): void;
	onMute(): void;
	changeSrc(src: keyof PlayerSrc): void;
}

export function PlayerControls({
	controlsEl,
	isPlaying,
	isEnded,
	isMuted,
	isFullscreen,
	isVideoLoaded,
	onTimelineClick,
	captions = [],
	progress,
	progressPercent,
	timelineEl,
	onEnterFullscreen,
	onExitFullscreen,
	onCaptionsChange,
	onCaptionsToggle,
	onMute,
	onUnmute,
	onPause,
	onPlay,
	onVolumeChange,
	activeCaptionsIndex,
	activeSrc,
	changeSrc,
	src,
	volume,
}: PlayerControlsProps) {
	const captionsMenu: MenuItem[] = [
		...captions.map((caption, i) => ({
			label: caption.label,
			onClick: () => onCaptionsChange(i),
			active: activeCaptionsIndex === i,
		})),
		{
			label: "Disabled",
			onClick: () => onCaptionsChange(null),
			active: activeCaptionsIndex === null,
		},
	];
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
					<div className="AngelinPlayer__controls-buttons__group">
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
						{isMuted ? (
							<IconButton icon="VolumeOff" onClick={onUnmute} />
						) : (
							<IconButton
								icon={getVolumeIcon(volume)}
								onClick={onMute}
							/>
						)}
						<input
							className="AngelinPlayer__controls-volumeslider"
							type="range"
							value={volume * 100}
							onChange={e =>
								onVolumeChange(parseInt(e.target.value) / 100)
							}
							min={0}
							max={100}
							style={{ backgroundSize: `${volume * 100}%` }}
						/>
					</div>
					<div className="AngelinPlayer__controls-buttons__group">
						<IconButton icon="Subtitles" menuItems={captionsMenu} />
						<IconButton
							icon="HD"
							menuItems={Object.keys(src).map(src => ({
								label: src,
								onClick: () => changeSrc(src),
								active: src === activeSrc,
							}))}
						/>
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
			</div>
		</>
	);
}
