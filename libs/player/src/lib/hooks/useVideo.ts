import { useCallback, useEffect, useMemo, useState } from "react";
import { clamp, formatProgress } from "../common/helpers";
import { BufferRange } from "../types/player";
import type {
	UseVideoController,
	UseVideoState,
	Float,
	UseVideoOptions,
} from "../types/useVideo";

const DEFAULT_OPTIONS = {
	initialVolume: 0.5,
} as const;

export function useVideo(
	videoRef: React.RefObject<HTMLVideoElement>,
	options: UseVideoOptions = DEFAULT_OPTIONS
): [UseVideoState, UseVideoController] {
	const [bufferRanges, setBufferRanges] = useState<BufferRange[]>([]);
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

	const goToStart = useCallback(() => {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.currentTime = 0;
	}, [videoRef]);

	function goToEnd() {
		// Duration may be NaN until video is loaded
		if (!videoRef.current || isNaN(videoRef.current.duration)) {
			return;
		}
		videoRef.current.currentTime = videoRef.current.duration;
	}

	const reset = useCallback(() => {
		setIsPlaying(false);
		setIsLoaded(false);
	}, []);

	function mute() {
		if (!videoRef.current) {
			return;
		}
		setIsMuted(true);
	}

	function unmute() {
		if (!videoRef.current) {
			return;
		}
		setIsMuted(false);
	}

	function toggleMute() {
		isMuted ? unmute() : mute();
	}

	// console.log(videoRef.current?.networkState);

	/**
	 * Number must be a float between 0 and 1.
	 */
	function bumpVolume(offset: Float) {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.volume = clamp(videoRef.current.volume + offset, 0, 1);
	}

	const restart = useCallback(() => {
		reset();
		goToStart();
		play();
	}, [reset, play, goToStart]);

	function skip(seconds: number) {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.currentTime += seconds;
	}

	const getBufferRanges = useCallback(() => {
		if (!videoRef.current) {
			return;
		}
		const bufferRanges: BufferRange[] = [];
		for (let i = 0; i < videoRef.current.buffered.length; i++) {
			bufferRanges.push([
				videoRef.current.buffered.start(i),
				videoRef.current.buffered.end(i),
			]);
		}
		setBufferRanges(bufferRanges);
	}, [videoRef]);

	useEffect(() => {
		const interval = setInterval(getBufferRanges, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [getBufferRanges]);

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

		// Set the volume to default on first render
		video.volume = volume;

		function onLoadedData(e: Event) {
			const target = e.target as HTMLVideoElement;
			setIsLoaded(true);
			setDuration(target.duration);
		}

		function onVolumeChange(e: Event) {
			const target = e.target as HTMLVideoElement;
			setVolume(target.volume);
		}

		function onTimeUpdate(e: Event) {
			const target = e.target as HTMLVideoElement;
			setProgress(target.currentTime);
		}

		function onEnded(e: Event) {
			const target = e.target as HTMLVideoElement;
			setIsEnded(target.ended);
		}

		function fullscreenHandler() {
			setIsFullscreen(Boolean(document.fullscreenElement));
		}

		function onPlay(e: Event) {
			const target = e.target as HTMLVideoElement;
			setIsPlaying(!target.paused);
			setIsEnded(target.ended);
		}

		function onPause(e: Event) {
			const target = e.target as HTMLVideoElement;
			setIsPlaying(!target.paused);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoRef]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		const video = videoRef.current;
		function clickHandler() {
			isEnded ? restart() : togglePlaying();
		}
		video.addEventListener("click", clickHandler);
		return () => {
			video.removeEventListener("click", clickHandler);
		};
	}, [videoRef, togglePlaying, isEnded, restart]);

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
			bufferRanges,
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
