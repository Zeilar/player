import { useMemo } from "react";
import { MenuItem } from "../../types/icons";
import { PlayerCaptions, PlayerQuality } from "../../types/player";
import { UseVideoController, UseVideoState } from "../../types/useVideo";
import { IconButton } from "../IconButton";
import {
	exitFullscreen,
	formatProgress,
	getVolumeIcon,
} from "../../common/helpers";

export interface PlayerControlsProps {
	state: UseVideoState;
	controller: UseVideoController;
	controlsEl: React.RefObject<HTMLDivElement>;
	timelineEl: React.RefObject<HTMLDivElement>;
	activeCaptionsIndex: number | null;
	currentQualityId: number;
	qualities: PlayerQuality[];
	captions?: PlayerCaptions[];
	changeCaptions(index: number | null): void;
	onTimelineClick(e: React.MouseEvent<HTMLDivElement>): void;
	enterFullscreen(): void;
	changeQuality(id: number): void;
}

export function PlayerControls({
	state,
	controller,
	controlsEl,
	onTimelineClick,
	captions = [],
	timelineEl,
	enterFullscreen,
	changeCaptions,
	activeCaptionsIndex,
	currentQualityId,
	changeQuality,
	qualities,
}: PlayerControlsProps) {
	const formattedProgress = useMemo(
		() => formatProgress(state.progress),
		[state.progress]
	);
	const formattedDuration = useMemo(
		() => formatProgress(state.duration),
		[state.duration]
	);
	const progressInPercent = useMemo(() => {
		if (!state.isLoaded) {
			return undefined;
		}
		const percent = (state.progress / state.duration) * 100;
		return `${percent}%`;
	}, [state.duration, state.isLoaded, state.progress]);

	const captionsMenu: MenuItem[] = [
		...captions.map((caption, i) => ({
			label: caption.label,
			onClick: () => changeCaptions(i),
			active: activeCaptionsIndex === i,
		})),
		{
			label: "Disabled",
			onClick: () => changeCaptions(null),
			active: activeCaptionsIndex === null,
		},
	];

	return (
		<>
			<svg
				className="AngelinPlayer__big-resume-icon"
				viewBox="0 0 24 24"
				data-hidden={state.isPlaying}
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
							style={{ width: progressInPercent }}
						/>
					</div>
				</div>
				<div className="AngelinPlayer__controls-buttons">
					<div className="AngelinPlayer__controls-buttons__group">
						{state.isPlaying ? (
							<IconButton
								disabled={!state.isLoaded}
								onClick={controller.pause}
								icon="Pause"
							/>
						) : (
							<IconButton
								disabled={!state.isLoaded}
								onClick={
									state.isEnded
										? controller.restart
										: controller.play
								}
								icon={state.isEnded ? "Replay" : "Play"}
							/>
						)}
						{state.isMuted ? (
							<IconButton
								icon="VolumeOff"
								onClick={controller.unmute}
							/>
						) : (
							<IconButton
								icon={getVolumeIcon(state.volume)}
								onClick={controller.mute}
							/>
						)}
						<input
							className="AngelinPlayer__controls-volumeslider"
							type="range"
							value={state.volume * 100}
							onChange={e =>
								controller.changeVolume(
									parseInt(e.target.value) / 100
								)
							}
							min={0}
							max={100}
							style={{ backgroundSize: `${state.volume * 100}%` }}
						/>
						<span className="AngelinPlayer__controls-progress">
							{`${formattedProgress} / ${formattedDuration}`}
						</span>
					</div>
					<div className="AngelinPlayer__controls-buttons__group">
						<IconButton
							icon="Subtitles"
							menuItems={captionsMenu}
							menuTitle="Captions"
						/>
						<IconButton
							icon="HD"
							menuItems={qualities.map(quality => ({
								label: quality.label,
								onClick: () => changeQuality(quality.id),
								active: quality.id === currentQualityId,
							}))}
							menuTitle="Quality"
						/>
						{state.isFullscreen ? (
							<IconButton
								onClick={exitFullscreen}
								icon="FullscreenExit"
							/>
						) : (
							<IconButton
								onClick={enterFullscreen}
								icon="FullscreenOpen"
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
