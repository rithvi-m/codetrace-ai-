import React, { useState, useEffect, useRef } from 'react';
import { fetchNetworkGraph } from '../services/api';
import { NetworkGraphData } from '../types';
import { Share2, ZoomIn, ZoomOut, RefreshCw, ArrowUpRight } from 'lucide-react';

interface NetworkGraphProps {
  onOpenComparison: (pairId: number) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ onOpenComparison }) => {
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const res = await fetchNetworkGraph();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Computing Similarity Network Graph...</div>;
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        No graph data available. Click "Hackathon Demo Mode" to seed student nodes and edges.
      </div>
    );
  }

  // Position nodes in a circle layout for smooth visual representation
  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 200;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  data.nodes.forEach((node, i) => {
    const angle = (i / data.nodes.length) * 2 * Math.PI;
    nodePositions[node.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Similarity Network Graph</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual cluster mapping of cross-student code similarity networks and collusion rings.
          </p>
        </div>

        <button
          onClick={loadGraph}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Graph</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Network Graph Canvas */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2 shadow-xl flex flex-col items-center justify-center relative min-h-[520px]">
          <svg ref={canvasRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[500px]">
            {/* Draw Links */}
            {data.links.map((link, i) => {
              const posA = nodePositions[link.source];
              const posB = nodePositions[link.target];
              if (!posA || !posB) return null;

              const isHigh = link.value >= 75;
              const isMed = link.value >= 50;

              const strokeColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#3B82F6';
              const strokeWidth = isHigh ? 3.5 : isMed ? 2.5 : 1.5;

              return (
                <g key={i} className="cursor-pointer group" onClick={() => setSelectedLink(link)}>
                  <line
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.7}
                    className="hover:stroke-white transition-all"
                  />
                  {/* Score Label on Edge */}
                  <rect
                    x={(posA.x + posB.x) / 2 - 16}
                    y={(posA.y + posB.y) / 2 - 10}
                    width={32}
                    height={18}
                    rx={4}
                    fill="#0F172A"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={(posA.x + posB.x) / 2}
                    y={(posA.y + posB.y) / 2 + 3}
                    fill="#F8FAFC"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {Math.round(link.value)}%
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {data.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r={22}
                    fill="#1E293B"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    className="hover:scale-110 transition-transform cursor-pointer"
                  />
                  <text
                    y={4}
                    fill="#F8FAFC"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  <text
                    y={34}
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.student_id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Link / Node Inspector Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3 mb-4">
              Cluster Inspector
            </h3>

            {selectedLink ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Connection Pair:</div>
                  <div className="text-sm font-bold text-white">
                    {data.nodes.find((n) => n.id === selectedLink.source)?.name} ↔{' '}
                    {data.nodes.find((n) => n.id === selectedLink.target)?.name}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                    <span className="text-xs text-slate-400">Risk Assessment:</span>
                    <span className="text-xs font-mono font-bold text-red-400">{selectedLink.value}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenComparison(selectedLink.pair_id)}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-lg"
                >
                  <span>Open Side-by-Side Comparison</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-12">
                Click any connection line on the graph to inspect pair details and launch code comparison.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-850 mt-6">
            <strong>Graph Insight:</strong> Nodes positioned closer together with thicker red lines indicate suspicious multi-student sharing clusters.
          </div>
        </div>
      </div>
    </div>
  );
};
