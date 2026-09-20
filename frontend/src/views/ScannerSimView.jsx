import React, { useState } from 'react';
import { api } from '../services/api';

export default function ScannerSimView() {
  const [onionAddress, setOnionAddress] = useState('krypton7x3qj9z8m2v1p4l6w5r0t8y7u1i3o5p7a9s1d3f5g7h9j1k3l5z7.onion');
  const [statusPageExposed, setStatusPageExposed] = useState(true);
  const [certFingerprint, setCertFingerprint] = useState('a9f3b2c1e8d47056e9c0114a87b32ef8a1c90234d7f5619a0bc45ef20138abcd');
  const [serverBanner, setServerBanner] = useState('nginx/1.24.0 (Ubuntu)');
  const [sshKey, setSshKey] = useState('SHA256:7mK9pQ1wXyZ3vB5nC8rT2sF6jL0hN4uE');
  const [leakedIp, setLeakedIp] = useState('185.220.101.44');

  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleSimulateScan = async (e) => {
    e?.preventDefault();
    try {
      setScanning(true);
      const res = await api.simulateScan({
        onionAddress,
        statusPageExposed,
        certFingerprint,
        serverBanner,
        sshKey,
        leakedIp
      });
      setScanResult(res.data);
    } catch (err) {
      alert('Scan simulation failed: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const loadPreset = (type) => {
    if (type === 'KRYPTON_LEAK') {
      setOnionAddress('krypton7x3qj9z8m2v1p4l6w5r0t8y7u1i3o5p7a9s1d3f5g7h9j1k3l5z7.onion');
      setStatusPageExposed(true);
      setCertFingerprint('a9f3b2c1e8d47056e9c0114a87b32ef8a1c90234d7f5619a0bc45ef20138abcd');
      setServerBanner('nginx/1.24.0 (Ubuntu)');
      setSshKey('SHA256:7mK9pQ1wXyZ3vB5nC8rT2sF6jL0hN4uE');
      setLeakedIp('185.220.101.44');
    } else if (type === 'VOLCANO_SSH') {
      setOnionAddress('volcanostresser998234710293847192837461928374619283.onion');
      setStatusPageExposed(true);
      setCertFingerprint('5e2b8104c3f9a7d2e0b51688942a1ef6c4193027b8e1f5d263901bcae543fedc');
      setServerBanner('Apache/2.4.52 (Debian)');
      setSshKey('SHA256:volcano8892keyNodeRomHost2026');
      setLeakedIp('194.26.29.112');
    } else {
      setOnionAddress('securehiddenmarket99238471928374619283746192837461.onion');
      setStatusPageExposed(false);
      setCertFingerprint('');
      setServerBanner('Apache/2.4');
      setSshKey('');
      setLeakedIp('');
    }
  };

  return (
    <div className="scanner-sim-view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 font-mono fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-hdd-network-fill text-info"></i>
            MODULE 1: INFRASTRUCTURE LEAK SCANNER (SIMULATED PROBE)
          </h2>
          <p className="text-secondary small font-mono mb-0">
            Rules engine analyzing Tor Hidden Service misconfigurations, SSL certificate fingerprints, and clearnet server cross-matches.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Input Probe Form */}
        <div className="col-12 col-lg-6">
          <div className="soc-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-terminal-fill text-info"></i>
                <span className="fw-bold font-mono text-dark small">SIMULATED ONION METADATA PAYLOAD</span>
              </div>
              <div className="btn-group">
                <button className="btn btn-sm btn-dark border-secondary text-secondary font-mono" onClick={() => loadPreset('KRYPTON_LEAK')}>
                  Krypton Preset
                </button>
                <button className="btn btn-sm btn-dark border-secondary text-secondary font-mono" onClick={() => loadPreset('VOLCANO_SSH')}>
                  Volcano Preset
                </button>
                <button className="btn btn-sm btn-dark border-secondary text-secondary font-mono" onClick={() => loadPreset('CLEAN')}>
                  Clean Preset
                </button>
              </div>
            </div>

            <form onSubmit={handleSimulateScan}>
              <div className="mb-3">
                <label className="form-label text-secondary font-mono small mb-1">TARGET .ONION ADDRESS:</label>
                <input
                  type="text"
                  className="form-control bg-white border-secondary text-info font-mono small"
                  value={onionAddress}
                  onChange={(e) => setOnionAddress(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary font-mono small mb-1">SSL CERTIFICATE SHA-256 HASH:</label>
                <input
                  type="text"
                  className="form-control bg-white border-secondary text-warning font-mono small"
                  value={certFingerprint}
                  onChange={(e) => setCertFingerprint(e.target.value)}
                  placeholder="e.g. a9f3b2c1..."
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary font-mono small mb-1">SERVER BANNER:</label>
                  <input
                    type="text"
                    className="form-control bg-white border-secondary text-dark font-mono small"
                    value={serverBanner}
                    onChange={(e) => setServerBanner(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary font-mono small mb-1">LEAKED CLEARNET IP:</label>
                  <input
                    type="text"
                    className="form-control bg-white border-secondary text-danger font-mono small"
                    value={leakedIp}
                    onChange={(e) => setLeakedIp(e.target.value)}
                    placeholder="e.g. 185.220.101.44"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary font-mono small mb-1">SSH HOST KEY FINGERPRINT:</label>
                <input
                  type="text"
                  className="form-control bg-white border-secondary text-dark font-mono small"
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  placeholder="SHA256:..."
                />
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="statusPageSwitch"
                  checked={statusPageExposed}
                  onChange={(e) => setStatusPageExposed(e.target.checked)}
                />
                <label className="form-check-label text-dark font-mono small" htmlFor="statusPageSwitch">
                  Simulate Exposed Status Page (/server-status or phpinfo)
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-info text-dark font-mono fw-bold w-100 d-flex justify-content-center align-items-center gap-2"
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span>PROBING CLEARNET INFRASTRUCTURE REGISTRY...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-radar"></i>
                    <span>Execute Infrastructure Probe & Correlate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Scan Output & Rules Engine Log */}
        <div className="col-12 col-lg-6">
          <div className="soc-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-cpu text-info"></i>
              <span className="fw-bold font-mono text-dark small">RULES ENGINE CORRELATION OUTPUT</span>
            </div>

            {scanResult ? (
              <div className="d-flex flex-column gap-3">
                {/* Score Banner */}
                <div className="p-3 rounded soc-card d-flex justify-content-between align-items-center" style={{ background: 'var(--soc-surface-hover)' }}>
                  <div>
                    <div className="text-secondary font-mono small">INFRASTRUCTURE LINK CONFIDENCE:</div>
                    <h3 className="font-mono text-dark mb-0">{Math.round(scanResult.score * 100)}%</h3>
                  </div>
                  <span className={`badge-cyber ${scanResult.confidenceTier === 'HIGH' ? 'badge-cyber-critical' : scanResult.confidenceTier === 'MEDIUM' ? 'badge-cyber-high' : 'badge-cyber-low'}`}>
                    {scanResult.confidenceTier} RISK
                  </span>
                </div>

                {/* Matched Host */}
                {scanResult.matchedClearnetHost && (
                  <div className="soc-card p-3 font-mono small" style={{ borderLeft: '3px solid #ff4757' }}>
                    <div className="text-danger fw-bold mb-1">
                      <i className="bi bi-exclamation-octagon-fill me-1"></i>
                      DE-ANONYMIZED CLEARNET ORIGIN NODE:
                    </div>
                    <div className="text-dark">Host: <strong>{scanResult.matchedClearnetHost.hostname}</strong> ({scanResult.matchedClearnetHost.ip})</div>
                    <div className="text-secondary">ASN: AS{scanResult.matchedClearnetHost.asn} ({scanResult.matchedClearnetHost.isp}, {scanResult.matchedClearnetHost.country})</div>
                  </div>
                )}

                {/* Rules Triggered */}
                <div>
                  <div className="text-secondary font-mono small mb-1">TRIGGERED CORRELATION RULES:</div>
                  <div className="d-flex flex-column gap-2">
                    {scanResult.findings.map((f, idx) => (
                      <div key={idx} className="soc-card p-2 font-mono small" style={{ background: 'var(--soc-code-bg)', fontSize: '0.75rem' }}>
                        <div className="d-flex justify-content-between text-info">
                          <span>{f.rule || 'RULE'}</span>
                          <span>{f.severity}</span>
                        </div>
                        <div className="text-secondary mt-1">{f.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-secondary font-mono small p-5 text-center">
                Click "Execute Infrastructure Probe" to run simulated leak analysis against the clearnet server database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
