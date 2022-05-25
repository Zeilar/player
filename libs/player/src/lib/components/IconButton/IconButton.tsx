import "../../styles/player.scss";
import type { Icon, IconComponent } from "../../types/icons";
import { ReactComponent as FullscreenExit } from "../../assets/svgs/fullscreen-exit.svg";
import { ReactComponent as FullscreenOpen } from "../../assets/svgs/fullscreen-open.svg";
import { ReactComponent as Pause } from "../../assets/svgs/pause.svg";
import { ReactComponent as Play } from "../../assets/svgs/play.svg";
import { ReactComponent as Replay } from "../../assets/svgs/replay.svg";
import { ReactComponent as VolumeDown } from "../../assets/svgs/volume-down.svg";
import { ReactComponent as VolumeUp } from "../../assets/svgs/volume-up.svg";
import { ReactComponent as VolumeOff } from "../../assets/svgs/volume-off.svg";
import { ReactComponent as Subtitles } from "../../assets/svgs/subtitles.svg";

const icons: Record<Icon, IconComponent> = {
	FullscreenExit,
	FullscreenOpen,
	Pause,
	Play,
	Replay,
	VolumeDown,
	VolumeUp,
	VolumeOff,
	Subtitles,
};

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: Icon;
	svgProps?: React.SVGAttributes<SVGElement>;
}

export function IconButton({ icon, svgProps, ...props }: IconButtonProps) {
	const Icon = icons[icon];
	if (!Icon) {
		console.warn(`Icon ${icon} not found.`);
		return null;
	}
	return (
		<button className="AngelinPlayer__button" {...props}>
			<Icon {...svgProps} />
		</button>
	);
}
