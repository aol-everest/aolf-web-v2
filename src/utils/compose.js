import { memo } from 'react';

/**
 * A component that composes multiple components into a single nested structure
 * @param {Object} props - Component props
 * @param {Array<React.ComponentType>} props.components - Array of components to compose
 * @param {React.ReactNode} props.children - Child elements to wrap
 */
export const Compose = memo(function Compose({ components = [], children }) {
  try {
    // Early return if no components
    if (!components.length) return children;

    // Validate components
    if (
      !components.every(
        (comp) =>
          typeof comp === 'function' ||
          (typeof comp === 'object' && comp.$$typeof),
      )
    ) {
      console.error('Compose: All components must be valid React components');
      return children;
    }

    return components.reduceRight((acc, Component) => {
      // Skip null/undefined components
      if (!Component) return acc;

      try {
        return <Component>{acc}</Component>;
      } catch (err) {
        console.error(`Error rendering component in Compose:`, err);
        return acc;
      }
    }, children);
  } catch (err) {
    console.error('Error in Compose component:', err);
    return children;
  }
});

// Add display name for better debugging
Compose.displayName = 'Compose';
