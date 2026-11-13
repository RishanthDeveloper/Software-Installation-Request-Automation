import { useState } from 'react';
import { Link } from 'react-router-dom';

// The entrance plays once a visit, then the hero just stands.
function useEntranceOnce() {
  const [play] = useState(() => {
    try {
      if (sessionStorage.getItem('entered')) return false;
      sessionStorage.setItem('entered', '1');
    } catch {
      // storage blocked: play it anyway
    }
    return true;
  });
  return play;
}

// A live preview of the product: a request part way through approval.
function ProductPreview() {
  const steps = [
    { name: 'Submitted', state: 'done', time: 'Done' },
    { name: 'Manager', state: 'done', time: 'Done' },
    { name: 'IT approval', state: 'current', time: 'Now' },
    { name: 'Installed', state: 'upcoming', time: '' },
  ];
  return (
    <div className="app-frame enter-frame" role="img"
      aria-label="A request for Docker Desktop, approved by the manager and waiting for IT">
      <div className="app-frame__bar">
        <span className="mark" aria-hidden="true" />
        Software Requests
      </div>
      <div className="app-frame__body">
        <div className="app-frame__title">
          <div>
            <span className="mono muted">SR-00042</span>
            <strong>Docker Desktop</strong>
          </div>
          <span className="status status--pending_it">Waiting for IT</span>
        </div>
        <ol className="track">
          {steps.map((s) => (
            <li key={s.name} className={`track__step is-${s.state}`}>
              <span className="track__dot" />
              <span className="track__name">{s.name}</span>
              <span className="track__time">{s.time}</span>
            </li>
          ))}
        </ol>
        <ul className="history">
          <li><span><strong>Sneha Reddy</strong> asked for it for the payments service</span></li>
          <li><span><strong>Ravi Kumar</strong> approved as Engineering manager</span></li>
          <li><span><strong>IT support</strong> checks the license count next</span></li>
        </ul>
      </div>
    </div>
  );
}

export default function AuthLayout({ lines, lead, children, foot }) {
  const play = useEntranceOnce();

  return (
    <div className={`auth${play ? ' enter' : ''}`}>
      <div className="auth__side">
        <Link to="/login" className="brand"><span className="mark" aria-hidden="true" />Software Requests</Link>
        <main className="auth__body" id="main">
          <h1>
            {lines.map((line) => (
              <span className="enter-line" key={line}><span>{line}</span></span>
            ))}
          </h1>
          <p className="auth__lead enter-up" style={{ '--i': 0 }}>{lead}</p>
          <div className="enter-up" style={{ '--i': 1 }}>{children}</div>
        </main>
        <p className="auth__foot enter-up" style={{ '--i': 2 }}>{foot}</p>
      </div>
      <div className="auth__stage ground-inverse">
        <ProductPreview />
      </div>
    </div>
  );
}
