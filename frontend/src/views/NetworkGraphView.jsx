import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { api } from '../services/api';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function NetworkGraphView({ onNavigate }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [minConfidence, setMinConfidence] = useState(30);
  const [includeIdentifiers, setIncludeIdentifiers] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    // Watch for theme toggle (set on <html data-theme="...">) so the graph
    // re-fetches with matching node/label colors when the user switches modes.
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme((prev) => (prev !== current ? current : prev));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadAndRenderGraph();
  }, [minConfidence, includeIdentifiers, theme]);

  const loadAndRenderGraph = async () => {
    try {
      setLoading(true);
      const res = await api.getGraphData(minConfidence, includeIdentifiers, theme);
      const { nodes, edges } = res.data;

      setGraphStats({ nodes: nodes.length, edges: edges.length });

      if (containerRef.current) {
        const data = { nodes, edges };
        const options = {
          physics: {
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
              gravitationalConstant: -70,
              centralGravity: 0.015,
              springLength: 120,
              springConstant: 0.08,
              damping: 0.8
            },
            maxVelocity: 40,
            minVelocity: 0.1,
            stabilization: { iterations: 150 }
          },
          interaction: {
            hover: true,
            tooltipDelay: 100,
            navigationButtons: false,
            keyboard: false,
            zoomView: true
          },
          nodes: {
            borderWidthSelected: 4,
            shadow: true
          },
          edges: {
            smooth: { type: 'continuous' }
          }
        };

        if (networkRef.current) {
          networkRef.current.destroy();
        }

        const network = new Network(containerRef.current, data, options);
        networkRef.current = network;

        // Node click handler
        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeData = nodes.find(n => n.id === nodeId);
            setSelectedNode(nodeData || null);
            setSelectedEdge(null);
          } else if (params.edges.length > 0) {
            const edgeId = params.edges[0];
            const edgeData = edges.find(e => e.id === edgeId);
            setSelectedEdge(edgeData || null);
            setSelectedNode(null);
          } else {
            setSelectedNode(null);
            setSelectedEdge(null);
          }
        });
      }
    } catch (e) {
      console.error('Failed to load graph:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.3 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.7 });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 500 } });
    }
  };

  return (
    <div className="network-graph-view position-relative">
      {/* Top Header & Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="h4 font-mono fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-diagram-3-fill text-info"></i>
            IDENTITY & ATTRIBUTION KNOWLEDGE GRAPH
          </h2>
          <p className="text-secondary small font-mono mb-0">
            Interactive multi-entity network mapping personas, shared PGP/wallet identifiers, and Bayesian attribution links.
          </p>
        </div>

        {/* Graph Meta stats */}
        <div className="d-flex align-items-center gap-2">
          <span className="badge-cyber badge-cyber-medium font-mono">
            {graphStats.nodes} NODES &bull; {graphStats.edges} EDGES
          </span>
        </div>
      </div>

      {/* Control Ribbon & Filter Bar */}
      <div className="soc-card p-3 mb-3">
        <div className="row g-3 align-items-center">
          {/* Slider for Min Confidence */}
          <div className="col-12 col-md-5">
            <div className="d-flex justify-content-between text-secondary font-mono small mb-1" style={{ fontSize: '0.75rem' }}>
              <span>MIN ATTRIBUTION THRESHOLD:</span>
              <span className="text-info fw-bold">{minConfidence}%</span>
            </div>
            <input
              type="range"
              className="form-range soc-slider w-100"
              min="0"
              max="90"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseInt(e.target.value, 10))}
            />
          </div>

          {/* Toggle Identifiers */}
          <div className="col-12 col-md-4">
            <div className="form-check form-switch font-mono small text-secondary">
              <input
                className="form-check-input"
                type="checkbox"
                id="toggleIdNodes"
                checked={includeIdentifiers}
                onChange={(e) => setIncludeIdentifiers(e.target.checked)}
              />
              <label className="form-check-label text-dark" htmlFor="toggleIdNodes">
                Include Crypto Wallets & PGP Nodes
              </label>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="col-12 col-md-3 d-flex justify-content-md-end gap-1">
            <button className="btn btn-sm btn-outline-secondary font-mono" onClick={handleZoomIn} title="Zoom In">
              <i className="bi bi-zoom-in"></i>
            </button>
            <button className="btn btn-sm btn-outline-secondary font-mono" onClick={handleZoomOut} title="Zoom Out">
              <i className="bi bi-zoom-out"></i>
            </button>
            <button className="btn btn-sm btn-outline-secondary font-mono" onClick={handleFit} title="Fit to Screen">
              <i className="bi bi-arrows-fullscreen"></i> Fit
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Side Inspector Drawer */}
      <div className="row g-3">
        {/* Graph Canvas */}
        <div className="col-12 col-lg-8 col-xl-9">
          <div 
            className="soc-card position-relative overflow-hidden" 
            style={{ height: '620px', background: 'var(--soc-bg)' }}
          >
            {loading && (
              <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center gap-2 font-mono text-info z-3">
                <div className="spinner-border spinner-border-sm" role="status"></div>
                <span>RENDERING KNOWLEDGE GRAPH...</span>
              </div>
            )}

            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

            {/* Edge Legend Overlay */}
            <div 
              className="position-absolute bottom-0 start-0 m-3 p-2 rounded soc-card font-mono small" 
              style={{ background: 'var(--soc-surface)', opacity: 0.95, backdropFilter: 'blur(5px)', fontSize: '0.7rem' }}
            >
              <div className="text-secondary fw-bold mb-1">GRAPH EDGE LEGEND:</div>
              <div className="d-flex flex-wrap gap-2">
                <div className="d-flex align-items-center gap-1">
                  <span style={{ width: '12px', height: '3px', background: '#00ff9d' }}></span>
                  <span className="text-dark">&ge;75% High Attribution</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span style={{ width: '12px', height: '3px', background: '#00d4ff' }}></span>
                  <span className="text-dark">50-74% Moderate Lead</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span style={{ width: '12px', height: '2px', background: '#ffa502', borderStyle: 'dashed' }}></span>
                  <span className="text-dark">PGP/Wallet ID Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Entity Inspector Drawer */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div className="soc-card p-3 h-100" style={{ minHeight: '620px' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-info-circle-fill text-info"></i>
              <span className="fw-bold font-mono text-dark small">INSPECTOR DRAWER</span>
            </div>

            {selectedNode ? (
              <div>
                {selectedNode.nodeType === 'ACTOR' && selectedNode.actorData ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={selectedNode.actorData.avatar}
                        alt={selectedNode.actorData.handle}
                        className="rounded border border-info"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div>
                        <h5 className="font-mono text-dark mb-0">{selectedNode.actorData.handle}</h5>
                        <span className="badge-cyber badge-cyber-critical" style={{ fontSize: '0.65rem' }}>
                          {selectedNode.actorData.threatLevel}
                        </span>
                      </div>
                    </div>

                    <div className="font-mono small text-secondary">
                      <div>Category: <strong className="text-dark">{selectedNode.actorData.category}</strong></div>
                      <div>Source: <span className="text-info">{selectedNode.actorData.source}</span></div>
                    </div>

                    <div className="d-flex flex-column gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-info text-dark font-mono fw-bold"
                        onClick={() => onNavigate('actor-detail', { actorId: selectedNode.id })}
                      >
                        View Full Dossier &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono small">
                    <div className="text-info fw-bold mb-1">{selectedNode.label}</div>
                    <div className="text-secondary">Type: {selectedNode.nodeType}</div>
                    <div className="text-muted small mt-2">{selectedNode.title?.replace(/<[^>]*>?/gm, '')}</div>
                  </div>
                )}
              </div>
            ) : selectedEdge ? (
              <div className="font-mono small">
                <div className="text-success fw-bold mb-1">Attribution Connection</div>
                <div className="text-secondary mb-2">From: {selectedEdge.from} &harr; {selectedEdge.to}</div>
                {selectedEdge.confidenceScore && (
                  <div className="mb-2">
                    <ConfidenceBadge score={selectedEdge.confidenceScore} />
                  </div>
                )}
                <div className="text-muted small mb-3">{selectedEdge.title?.replace(/<[^>]*>?/gm, '')}</div>
                <button
                  className="btn btn-sm btn-outline-info font-mono w-100"
                  onClick={() => onNavigate('investigator', { actorA: selectedEdge.from, actorB: selectedEdge.to })}
                >
                  Examine in Fusion Lab &rarr;
                </button>
              </div>
            ) : (
              <div className="text-secondary font-mono small text-center p-4">
                Click any persona node, identifier, or attribution edge on the canvas to inspect forensic properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
