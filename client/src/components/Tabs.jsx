import { useLayoutEffect, useRef } from 'react';

// Tabs that switch on click. One ink pill slides to the chosen tab by transform alone:
// it takes the new tab's width at once, starts scaled to the old width and settles to 1.
export default function Tabs({ tabs, value, onChange, label }) {
  const listRef = useRef(null);
  const pillRef = useRef(null);
  const lastWidth = useRef(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    const tab = list?.querySelector('[aria-selected="true"]');
    if (!tab || !pill) return;

    const width = tab.offsetWidth;
    const from = lastWidth.current ? lastWidth.current / width : 1;
    pill.style.width = `${width}px`;
    pill.style.transition = 'none';
    pill.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${from})`;
    const frame = requestAnimationFrame(() => {
      pill.style.transition = `transform var(--m-slide) var(--ease)`;
      pill.style.transform = `translateX(${tab.offsetLeft}px) scaleX(1)`;
    });
    lastWidth.current = width;
    return () => cancelAnimationFrame(frame);
  }, [value, tabs]);

  // the first paint: put the pill under the chosen tab without sliding
  useLayoutEffect(() => {
    const tab = listRef.current?.querySelector('[aria-selected="true"]');
    if (tab && pillRef.current) {
      pillRef.current.style.transform = `translateX(${tab.offsetLeft}px)`;
    }
  }, []);

  function onKeyDown(e) {
    const index = tabs.findIndex((t) => t.value === value);
    if (e.key === 'ArrowRight') onChange(tabs[(index + 1) % tabs.length].value);
    if (e.key === 'ArrowLeft') onChange(tabs[(index - 1 + tabs.length) % tabs.length].value);
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKeyDown}>
      <span className="tabs__pill" ref={pillRef} aria-hidden="true" />
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          className="tab"
          aria-selected={t.value === value}
          tabIndex={t.value === value ? 0 : -1}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {t.count !== undefined && <span className="n">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
