import { useEffect, useState, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { usePageVisibility } from 'react-page-visibility';
import { useScrollPercentage } from 'react-scroll-percentage';
import throttle from 'lodash.throttle';

export const usePageTriggers = ({
  onTimeTrigger,
  timeLimit = 180000, // 180 seconds
  onInactivityTrigger,
  inactivityLimit = 40000, // 40 seconds
  onScrollSpeedTrigger,
  mobileSpeedLimit = 120,
  desktopSpeedLimit = 70,
  onScrollDepthTrigger,
  scrollDepthLimit = 0.5, // 50%
  onVisibilityChange,
}) => {
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [lastScrollTop, setLastScrollTop] = useState(
    typeof window !== 'undefined' ? window.scrollY : 0,
  );
  const [lastTimestamp, setLastTimestamp] = useState(
    typeof window !== 'undefined' ? Date.now() : 0,
  );
  const [ref, percentage] = useScrollPercentage();

  const isVisible = usePageVisibility();
  const idleTimerRef = useRef(null);

  // Time-based trigger
  useEffect(() => {
    if (!onTimeTrigger) return;

    const timeTrigger = setTimeout(() => {
      onTimeTrigger();
    }, timeLimit);

    return () => clearTimeout(timeTrigger);
  }, [onTimeTrigger, timeLimit]);

  // Inactivity-based trigger
  useIdleTimer({
    ref: idleTimerRef,
    timeout: inactivityLimit,
    onIdle: onInactivityTrigger,
    debounce: 500,
    enabled: !!onInactivityTrigger, // Bind only if handler is provided
  });

  // Scrolling speed trigger
  useEffect(() => {
    if (!onScrollSpeedTrigger) return;

    const handleScroll = throttle(() => {
      const now = Date.now();
      const scrollTop = window.scrollY;
      const timeDiff = (now - lastTimestamp) / 1000; // Time difference in seconds
      const distance = Math.abs(scrollTop - lastScrollTop); // Distance scrolled in pixels
      const speed = distance / timeDiff; // Speed in pixels per second

      // Update the last known scroll position and timestamp
      setScrollSpeed(speed);
      setLastScrollTop(scrollTop);
      setLastTimestamp(now);

      // Determine device type and corresponding threshold
      const isMobile = window.innerWidth <= 768;
      const speedThreshold = isMobile ? mobileSpeedLimit : desktopSpeedLimit;

      // Trigger the event if the speed exceeds the threshold
      if (speed > speedThreshold) {
        onScrollSpeedTrigger(speed);
      }
    }, 100); // Throttle scroll handling to once every 100ms

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel(); // Cancel the throttled function to prevent memory leaks
    };
  }, [
    lastScrollTop,
    lastTimestamp,
    mobileSpeedLimit,
    desktopSpeedLimit,
    onScrollSpeedTrigger,
  ]);

  // Scrolling depth trigger
  useEffect(() => {
    if (!onScrollDepthTrigger) return;

    if (percentage >= scrollDepthLimit) {
      onScrollDepthTrigger(percentage);
    }
  }, [percentage, scrollDepthLimit, onScrollDepthTrigger]);

  // Page visibility trigger (tab change)
  useEffect(() => {
    if (!onVisibilityChange) return;

    onVisibilityChange(isVisible);
  }, [isVisible, onVisibilityChange]);

  return {
    ref, // Pass this to the container element to track scroll percentage
  };
};
