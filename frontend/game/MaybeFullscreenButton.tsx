import { useEffect, useState } from 'react';
import screenfull from 'screenfull';

export default function MaybeFullscreenButton() {
  const [isFullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    if (!screenfull.isEnabled) {
      return;
    }
    function onChange() {
      setFullscreen(screenfull.isFullscreen);
    }
    screenfull.on('change', onChange);
    return () => {
      screenfull.off('change', onChange);
    };
  }, []);
  return (
    <>
      {screenfull.isEnabled && !isFullscreen && (
        <button
          onClick={() => screenfull.request()}
          style={{
            top: 0,
            right: 0,
            position: 'absolute',
          }}
        >
          fullscreen
        </button>
      )}
    </>
  );
}
