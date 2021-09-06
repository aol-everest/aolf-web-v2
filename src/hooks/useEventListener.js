import { useRef, useEffect, useCallback, RefObject } from "react";
import { isSSR, getRefElement } from "@utils";

export const useEventListener = ({
  type,
  listener,
  element = isSSR ? undefined : window,
  options,
}) => {
  const savedListener = useRef();

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  const handleEventListener = useCallback((event) => {
    savedListener.current?.(event);
  }, []);

  useEffect(() => {
    const target = getRefElement(element);
    target?.addEventListener(type, handleEventListener, options);
    return () => target?.removeEventListener(type, handleEventListener);
  }, [type, element, options, handleEventListener]);
};
