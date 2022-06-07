import { useEffect, useRef, useState } from "react";

export function useAnimate<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (!ref.current) {
			return;
		}
		ref.current.dataset["animating"] = String(isAnimating);
	}, [isAnimating]);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		const element = ref.current;

		function onAnimationStart() {
			setIsAnimating(true);
		}
		function onAnimationEnd() {
			setIsAnimating(false);
		}

		element.addEventListener("animationstart", onAnimationStart);
		element.addEventListener("animationend", onAnimationEnd);
		element.addEventListener("animationcancel", onAnimationEnd);

		return () => {
			element.removeEventListener("animationstart", onAnimationStart);
			element.removeEventListener("animationend", onAnimationEnd);
			element.removeEventListener("animationcancel", onAnimationEnd);
		};
	}, []);

	return ref;
}
