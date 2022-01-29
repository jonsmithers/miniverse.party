import { useState } from 'react';
import screenfull from 'screenfull';

export default function MaybeFullscreenButton() {
  const [isFullscreen, setFullscreen] = useState(false);
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
        <button
          onClick={() => screenfull.request().then(() => setFullscreen(true))}
        >
          fullscreen
        </button>
      )}
      {isFullscreen && (
        <button
          onClick={() => screenfull.exit().then(() => setFullscreen(false))}
        >
          leave fullscreen
        </button>
      )}
    </div>
  );
}
