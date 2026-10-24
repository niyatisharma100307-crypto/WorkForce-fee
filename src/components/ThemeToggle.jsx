import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [powerMode, setPowerMode] = useState(
    localStorage.getItem('powerMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      powerMode ? 'power' : 'light'
    );

    localStorage.setItem('powerMode', powerMode);
  }, [powerMode]);

  return (
    <button
      className={`power-toggle ${powerMode ? 'active' : ''}`}
      onClick={() => setPowerMode((prev) => !prev)}
      title={powerMode ? 'Turn off Power Mode' : 'Activate Power Mode'}
      aria-label="Toggle Power Mode"
    >
      <span className="power-icon">⚡</span>
      <span>Power</span>
    </button>
  );
}