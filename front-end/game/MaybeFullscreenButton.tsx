import { useEffect, useState } from 'react';
import screenfull from 'screenfull';

export default function MaybeFullscreenButton() {
  const [isFullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    function onChange() {
      setFullscreen(screenfull.isFullscreen);
    }
    screenfull.on('change', onChange);
    return () => {
      screenfull.off('change', onChange);
    };
  }, []);
  if (!screenfull.isEnabled) {
    return <></>;
  }
  return (
    <div
      style={{
        top: '0',
        right: 0,
        position: 'absolute',
      }}
    >
      {!isFullscreen && (
        <button onClick={() => screenfull.request()}>
          fullscreen
        </button>
      )}
      {isFullscreen && (
        <button onClick={() => screenfull.exit()}>
          leave fullscreen
        </button>
      )}
    </div>
  );
}
