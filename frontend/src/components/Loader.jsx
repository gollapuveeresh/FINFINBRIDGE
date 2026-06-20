// src/components/Loader.jsx
import React, { useEffect, useState } from 'react';

const Loader = () => {
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Hide the loader 500ms after component mounts (standard landing page loader transition)
    const fadeTimeout = setTimeout(() => {
      setHide(true);
    }, 500);

    // Hard fallback to make sure loader disappears even if something hangs
    const fallbackTimeout = setTimeout(() => {
      setHide(true);
    }, 2500);

    // Fully remove from DOM after CSS transition (0.8s) completes
    const removeTimeout = setTimeout(() => {
      setRemoved(true);
    }, 1500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(fallbackTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (removed) return null;

  return (
    <div id="loader" className={hide ? 'hide' : ''}>
      <div className="lmark">
        <span className="m"></span>
        FinBridge
      </div>
    </div>
  );
};

export default Loader;
