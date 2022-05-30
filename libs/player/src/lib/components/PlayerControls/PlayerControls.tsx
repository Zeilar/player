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
	isScrubbing: boolean;
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
	isScrubbing,
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
		// If duration is anything but a positive integer, avoid getting NaN results.
		if (!state.duration) {
			return "0%";
		}
		const percent = (state.progress / state.duration) * 100;
		return `${percent}%`;
	}, [state.duration, state.progress]);

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
					{state.bufferRanges.map(([start, end], i) => (
						<div
							key={i}
							className="AngelinPlayer__timeline-track__buffer-range"
							data-buffer-range
							data-buffer-start={start}
							data-buffer-end={end}
						/>
					))}
					<div
						className="AngelinPlayer__timeline-track__progress"
						style={{ width: progressInPercent }}
					/>
				</div>
			</div>
			<div className="AngelinPlayer__controls-buttons">
				<div className="AngelinPlayer__controls-buttons__group">
					<IconButton
						isScrubbing={isScrubbing}
						tooltip="Back 10 seconds"
						icon="Replay10"
						onClick={() => controller.skip(-10)}
					/>
					{state.isPlaying ? (
						<IconButton
							isScrubbing={isScrubbing}
							onClick={controller.pause}
							icon="Pause"
							tooltip="Pause (space)"
						/>
					) : (
						<IconButton
							isScrubbing={isScrubbing}
							onClick={
								state.isEnded
									? controller.restart
									: controller.play
							}
							icon={state.isEnded ? "Replay" : "Play"}
							tooltip={
								state.isEnded
									? "Replay (space)"
									: "Play (space)"
							}
						/>
					)}
					<IconButton
						isScrubbing={isScrubbing}
						tooltip="Forward 10 seconds"
						icon="Forward10"
						onClick={() => controller.skip(10)}
					/>
					{state.isMuted ? (
						<IconButton
							isScrubbing={isScrubbing}
							icon="VolumeOff"
							onClick={controller.unmute}
							tooltip="Unmute (m)"
						/>
					) : (
						<IconButton
							isScrubbing={isScrubbing}
							icon={getVolumeIcon(state.volume)}
							onClick={controller.mute}
							tooltip="Mute (m)"
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
						isScrubbing={isScrubbing}
						icon="Subtitles"
						menuItems={captionsMenu}
						menuTitle="Captions"
						tooltip="Captions (c)"
					/>
					<IconButton
						isScrubbing={isScrubbing}
						icon="HD"
						menuItems={qualities.map(quality => ({
							label: quality.label,
							onClick: () => changeQuality(quality.id),
							active: quality.id === currentQualityId,
						}))}
						menuTitle="Quality"
						tooltip="Quality"
					/>
					{state.isFullscreen ? (
						<IconButton
							isScrubbing={isScrubbing}
							onClick={exitFullscreen}
							icon="FullscreenExit"
							tooltip="Fullscreen (f)"
						/>
					) : (
						<IconButton
							isScrubbing={isScrubbing}
							onClick={enterFullscreen}
							icon="FullscreenOpen"
							tooltip="Exit fullscreen (f)"
						/>
					)}
				</div>
			</div>
		</div>
	);
}
