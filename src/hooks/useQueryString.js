import { useRouter } from "next/router";
import React from "react";

// Implementation --------------------------------------------------------------

export function useQueryString(
  key,
  {
    history = "replace",
    parse = (x) => x,
    serialize = (x) => `${x}`,
    defaultValue,
  } = {},
) {
  const router = useRouter();

  // Memoizing the update function has the advantage of making it
  // immutable as long as `history` stays the same.
  // It reduces the amount of reactivity needed to update the state.
  const updateUrl = React.useMemo(
    () => (history === "push" ? router.push : router.replace),
    [history],
  );

  const getValue = React.useCallback(() => {
    if (typeof window === "undefined") {
      // Not available in an SSR context
      return null;
    }
    const query = new URLSearchParams(window.location.search);
    const value = query.get(key);
    return value !== null ? parse(value) : null;
  }, []);

  // Update the state value only when the relevant key changes.
  // Because we're not calling getValue in the function argument
  // of React.useMemo, but instead using it as the function to call,
  // there is no need to pass it in the dependency array.
  const value = React.useMemo(getValue, [router.query[key]]);

  const update = React.useCallback(
    (stateUpdater) => {
      const isUpdaterFunction = (input) => {
        return typeof input === "function";
      };

      // Resolve the new value based on old value & updater
      const oldValue = getValue();
      const newValue = isUpdaterFunction(stateUpdater)
        ? stateUpdater(oldValue)
        : stateUpdater;
      // We can't rely on router.query here to avoid causing
      // unnecessary renders when other query parameters change.
      // URLSearchParams is already polyfilled by Next.js
      const query = new URLSearchParams(window.location.search);
      if (newValue === null || newValue === undefined) {
        // Don't leave value-less keys hanging
        query.delete(key);
      } else {
        query.set(key, serialize(newValue));
      }

      // Remove fragment and query from asPath
      // router.pathname includes dynamic route keys, rather than the route itself,
      // e.g. /views/[view] rather than /views/my-view
      const [asPath] = router.asPath.split(/\?|#/, 1);
      const search = query.toString();
      const hash = window.location.hash;
      updateUrl?.call(
        router,
        {
          pathname: router.pathname,
          hash,
          search,
        },
        {
          pathname: asPath,
          hash,
          search,
        },
        { shallow: true },
      );
    },
    [key, updateUrl],
  );
  return [value ?? defaultValue ?? null, update];
}
