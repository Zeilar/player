import "../../styles/player.scss";
import type { Icon, IconComponent, MenuItem } from "../../types/icons";
import { ReactComponent as FullscreenExit } from "../../assets/svgs/fullscreen-exit.svg";
import { ReactComponent as FullscreenOpen } from "../../assets/svgs/fullscreen-open.svg";
import { ReactComponent as Pause } from "../../assets/svgs/pause.svg";
import { ReactComponent as Play } from "../../assets/svgs/play.svg";
import { ReactComponent as Replay } from "../../assets/svgs/replay.svg";
import { ReactComponent as VolumeDown } from "../../assets/svgs/volume-down.svg";
import { ReactComponent as VolumeUp } from "../../assets/svgs/volume-up.svg";
import { ReactComponent as VolumeOff } from "../../assets/svgs/volume-off.svg";
import { ReactComponent as Subtitles } from "../../assets/svgs/subtitles.svg";
import { ReactComponent as HD } from "../../assets/svgs/hd.svg";

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
	HD,
};

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: Icon;
	svgProps?: React.SVGAttributes<SVGElement>;
	menuItems?: MenuItem[];
}

export function IconButton({
	icon,
	svgProps,
	menuItems = [],
	...props
}: IconButtonProps) {
	const Icon = icons[icon];
	if (!Icon) {
		console.warn(`Icon ${icon} not found.`);
		return null;
	}
	if (menuItems.length === 0) {
		return (
			<button className="AngelinPlayer__button" {...props}>
				<Icon {...svgProps} />
			</button>
		);
	}
	return (
		<div className="AngelinPlayer__menu">
			{menuItems.length > 0 && (
				<ul className="AngelinPlayer__menu-list">
					{menuItems.map((item, i) => (
						<li
							key={i}
							className="AngelinPlayer__menu-list__item"
							data-active={item.active}
						>
							<button
								className="AngelinPlayer__menu-list__item-button"
								onClick={item.onClick}
							>
								{item.label}
							</button>
						</li>
					))}
				</ul>
			)}
			<button className="AngelinPlayer__button" {...props}>
				<Icon {...svgProps} />
			</button>
		</div>
	);
}
