import "../../styles/player.scss";
import { Icon, IconComponent, MenuItem, MenuPosition } from "../../types/icons";
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
import { ReactComponent as Close } from "../../assets/svgs/close.svg";
import { useCallback, useEffect, useState } from "react";
import { useOnClickOutside } from "use-ful-hooks-ts";

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
	Close,
};

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: Icon;
	svgProps?: React.SVGAttributes<SVGElement>;
	menuItems?: MenuItem[];
	menuTitle?: string;
}

export function IconButton({
	icon,
	svgProps,
	menuItems = [],
	menuTitle,
	...props
}: IconButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const menuWrapper = useOnClickOutside<HTMLDivElement>(() =>
		setIsOpen(false)
	);
	const [menuPosition, setMenuPosition] = useState<MenuPosition>("right");

	const Icon = icons[icon];

	const calculateMenuPosition = useCallback(() => {
		if (!menuWrapper.current) {
			return;
		}
		const playerEl = menuWrapper.current.closest("[data-player]");
		const menuListEl =
			menuWrapper.current.querySelector("[data-menu-list]");
		if (!playerEl || !menuListEl) {
			return;
		}
		const menuListElRect = menuListEl.getBoundingClientRect();
		const playerElRect = playerEl.getBoundingClientRect();
		setMenuPosition(
			menuListElRect.x + menuListElRect.width + 5 > playerElRect.width
				? "left"
				: "right"
		);
	}, [menuWrapper]);

	useEffect(() => {
		calculateMenuPosition();
	}, [calculateMenuPosition, isOpen]);

	if (!Icon) {
		console.warn(`Icon ${icon} not found.`);
		return null;
	}

	if (menuItems.length === 0) {
		return (
			<button
				className="AngelinPlayer__button"
				onClick={() => setIsActive(p => !p)}
				data-active={isActive}
				{...props}
			>
				<Icon {...svgProps} />
			</button>
		);
	}

	function menuItemOnClick(callback: () => void) {
		callback();
		setIsOpen(false);
	}

	return (
		<div className="AngelinPlayer__menu" ref={menuWrapper}>
			{menuItems.length > 0 && (
				<ul
					className="AngelinPlayer__menu-list"
					data-menu-list
					data-open={isOpen}
					style={{
						left: menuPosition === "right" ? 0 : "unset",
						right: menuPosition === "left" ? 0 : "unset",
					}}
				>
					<li className="AngelinPlayer__menu-list__item AngelinPlayer__menu-list__item-close">
						{menuTitle}
						<button
							className="AngelinPlayer__menu-list__item-close__button"
							onClick={() => setIsOpen(false)}
						>
							<Close className="AngelinPlayer__menu-list__item-close__button-icon" />
						</button>
					</li>
					<hr className="AngelinPlayer__menu-list__divider" />
					{menuItems.map((item, i) => (
						<li
							key={i}
							className="AngelinPlayer__menu-list__item"
							data-active={item.active}
						>
							<button
								className="AngelinPlayer__menu-list__item-button"
								onClick={() => menuItemOnClick(item.onClick)}
							>
								{item.label}
							</button>
						</li>
					))}
				</ul>
			)}
			<button
				className="AngelinPlayer__button"
				data-test="HELLO"
				onClick={() => setIsOpen(true)}
				{...props}
			>
				<Icon {...svgProps} />
			</button>
		</div>
	);
}
