import "../../styles/player.scss";
import { Icon, IconComponent, MenuItem, MenuPosition } from "../../types/icons";
import { useCallback, useEffect, useState, useRef } from "react";
import { useOnClickOutside } from "use-ful-hooks-ts";
import {
	FullscreenExit,
	Check,
	Close,
	FullscreenOpen,
	HD,
	Pause,
	Play,
	Replay,
	Subtitles,
	VolumeDown,
	VolumeOff,
	VolumeUp,
} from "../../assets/svgs";
import { clamp } from "../../common/helpers";

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
	Check,
};

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: Icon;
	svgProps?: React.SVGAttributes<SVGElement>;
	menuItems?: MenuItem[];
	menuTitle?: string;
	tooltip?: string;
}

export function IconButton({
	icon,
	svgProps,
	menuItems = [],
	menuTitle,
	tooltip,
	...props
}: IconButtonProps) {
	const tooltipRef = useRef<HTMLSpanElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const menuWrapper = useOnClickOutside<HTMLDivElement>(() =>
		setIsOpen(false)
	);
	const [menuPosition, setMenuPosition] = useState<MenuPosition>("right");
	const [tooltipCss, setTooltipCss] = useState<React.CSSProperties>({});

	const Icon = icons[icon];

	const hideTooltip = useCallback(() => {
		if (typeof tooltip !== "string") {
			return;
		}
		setTooltipCss({});
	}, [tooltip]);

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
		hideTooltip();
		setMenuPosition(
			menuListElRect.x + menuListElRect.width + 5 > playerElRect.width
				? "left"
				: "right"
		);
	}, [menuWrapper, hideTooltip]);

	const showTooltip = useCallback(() => {
		if (
			typeof tooltip !== "string" ||
			!tooltipRef.current ||
			!buttonRef.current
		) {
			return;
		}
		const wrapperEl = buttonRef.current.closest("[data-player]");
		if (!wrapperEl) {
			return;
		}
		const wrapperElRect = wrapperEl.getBoundingClientRect();
		const tooltipRect = tooltipRef.current.getBoundingClientRect();
		const buttonRect = buttonRef.current.getBoundingClientRect();
		const left = clamp(
			buttonRect.x + buttonRect.width / 2 - tooltipRect.width / 2,
			wrapperElRect.x + 10,
			wrapperElRect.width - tooltipRect.width
		);
		setTooltipCss({
			top: buttonRect.top - tooltipRect.height - 15,
			left,
		});
	}, [tooltip]);

	useEffect(() => {
		calculateMenuPosition();
	}, [calculateMenuPosition, isOpen]);

	if (!Icon) {
		console.warn(`Icon ${icon} not found.`);
		return null;
	}

	const sharedButtonProps = {
		className: "AngelinPlayer__button",
		ref: buttonRef,
		onMouseEnter: showTooltip,
		onMouseLeave: hideTooltip,
	};

	if (menuItems.length === 0) {
		return (
			<button
				onClick={() => setIsActive(p => !p)}
				data-active={isActive}
				{...sharedButtonProps}
				{...props}
			>
				{tooltip && (
					<span
						className="AngelinPlayer__button-tooltip"
						ref={tooltipRef}
						style={tooltipCss}
					>
						{tooltip}
					</span>
				)}
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
								{item.active && (
									<Check className="AngelinPlayer__menu-list__item-button__check" />
								)}
							</button>
						</li>
					))}
				</ul>
			)}
			<button
				onClick={() => setIsOpen(p => !p)}
				{...sharedButtonProps}
				{...props}
			>
				{tooltip && (
					<span
						className="AngelinPlayer__button-tooltip"
						ref={tooltipRef}
						style={tooltipCss}
					>
						{tooltip}
					</span>
				)}
				<Icon {...svgProps} />
			</button>
		</div>
	);
}
