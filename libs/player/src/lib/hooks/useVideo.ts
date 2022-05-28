import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp, formatProgress } from "../common/helpers";
import type {
	UseVideoController,
	UseVideoState,
	Float,
} from "../types/useVideo";

const DEFAULT_OPTIONS = {
	initialVolume: 0.5,
};

interface Options {
	// qualities?: PlayerQuality[];
	// controls?: boolean;
	// captions: PlayerCaptions[];
	// autoplay?: boolean;
	/**
	 * Float value between 0 and 1.
	 */
	initialVolume?: Float;
}

export function useVideo(
	videoRef: React.RefObject<HTMLVideoElement>,
	options: Options = DEFAULT_OPTIONS
): [UseVideoState, UseVideoController] {
	const prevVolume = useRef(
		options?.initialVolume ?? DEFAULT_OPTIONS.initialVolume
	);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isEnded, setIsEnded] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [duration, setDuration] = useState(0);
	const [progress, setProgress] = useState(0);
	const [volume, setVolume] = useState(
		options?.initialVolume ?? DEFAULT_OPTIONS.initialVolume
	);

	const formattedProgress = useMemo(
		() => formatProgress(progress),
		[progress]
	);
	const formattedDuration = useMemo(
		() => formatProgress(duration),
		[duration]
	);

	const play = useCallback(() => {
		videoRef.current?.play();
	}, [videoRef]);

	const pause = useCallback(() => {
		videoRef.current?.pause();
	}, [videoRef]);

	const togglePlaying = useCallback(() => {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.paused ? play() : pause();
	}, [videoRef, pause, play]);

	/**
	 * Volume should be a float between 0 and 1.
	 */
	function changeVolume(volume: Float) {
		if (!videoRef.current) {
			return;
		}
		unmute();
		videoRef.current.volume = clamp(volume, 0, 1);
	}

	function goToStart() {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.currentTime = 0;
	}

	function goToEnd() {
		// Duration may be NaN until video is loaded
		if (!videoRef.current || isNaN(videoRef.current.duration)) {
			return;
		}
		videoRef.current.currentTime = videoRef.current.duration;
	}

	function reset() {
		setIsPlaying(false);
		setIsLoaded(false);
	}

	function mute() {
		if (!videoRef.current) {
			return;
		}
		prevVolume.current = videoRef.current.volume;
		videoRef.current.volume = 0;
		setIsMuted(true);
	}

	function unmute() {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.volume = prevVolume.current;
		setIsMuted(false);
	}

	function toggleMute() {
		isMuted ? unmute() : mute();
	}

	function restart() {
		reset();
		play();
	}

	function skip(seconds: number) {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.currentTime += seconds;
	}

	/**
	 * Number must be a float between 0 and 1.
	 */
	function bumpVolume(offset: Float) {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.volume = clamp(videoRef.current.volume + offset, 0, 1);
	}

	useEffect(() => {
		if (!videoRef.current || isNaN(videoRef.current.duration)) {
			return;
		}
		setIsEnded(progress >= duration);
	}, [videoRef, progress, duration]);

	useEffect(() => {
		const video = videoRef.current;

		if (!video) {
			return;
		}

		video.volume = prevVolume.current;

		function onLoadedData(e: Event) {
			setIsLoaded(true);
			// @ts-expect-error types issue
			setDuration(e.target.duration);
		}

		function onVolumeChange(e: Event) {
			// @ts-expect-error types issue
			setVolume(e.target.volume);
		}

		function onTimeUpdate(e: Event) {
			// @ts-expect-error types issue
			setProgress(e.target.currentTime);
		}

		function onEnded(e: Event) {
			// @ts-expect-error types issue
			setIsEnded(e.target.ended);
		}

		function fullscreenHandler() {
			setIsFullscreen(Boolean(document.fullscreenElement));
		}

		function onPlay(e: Event) {
			// @ts-expect-error types issue
			setIsPlaying(!e.target.paused);
			// @ts-expect-error types issue
			setIsEnded(e.target.ended);
		}

		function onPause(e: Event) {
			// @ts-expect-error types issue
			setIsPlaying(!e.target.paused);
		}

		document.addEventListener("fullscreenchange", fullscreenHandler);
		video.addEventListener("loadeddata", onLoadedData);
		video.addEventListener("volumechange", onVolumeChange);
		video.addEventListener("timeupdate", onTimeUpdate);
		video.addEventListener("ended", onEnded);
		video.addEventListener("play", onPlay);
		video.addEventListener("pause", onPause);

		return () => {
			document.removeEventListener("fullscreenchange", fullscreenHandler);
			video.removeEventListener("loadeddata", onLoadedData);
			video.removeEventListener("volumechange", onVolumeChange);
			video.removeEventListener("timeupdate", onTimeUpdate);
			video.removeEventListener("ended", onEnded);
			video.removeEventListener("play", onPlay);
			video.removeEventListener("pause", onPause);
		};
	}, [videoRef]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		const video = videoRef.current;
		video.addEventListener("click", togglePlaying);
		return () => {
			video.removeEventListener("click", togglePlaying);
		};
	}, [videoRef, togglePlaying]);

	return [
		{
			isPlaying,
			isLoaded,
			isEnded,
			duration,
			progress,
			isMuted,
			isFullscreen,
			volume,
			formattedDuration,
			formattedProgress,
		},
		{
			play,
			pause,
			mute,
			unmute,
			toggleMute,
			skip,
			bumpVolume,
			togglePlaying,
			goToStart,
			goToEnd,
			reset,
			setProgress,
			changeVolume,
			restart,
		},
	];
}
