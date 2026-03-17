"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Save,
  RotateCcw,
  Loader2,
  GripHorizontal,
  Move,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api";

interface Seat {
  id: number;
  row_char: string;
  seat_number: number;
  x: number;
  y: number;
  angle: number;
  type: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
}

export default function SeatDesignerModal({ isOpen, onClose, roomId }: Props) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedSeatId, setDraggedSeatId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [marquee, setMarquee] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const fetchSeats = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<Seat[]>>(
        `/admin/rooms/${roomId}/seats`,
      ) as unknown as ApiResponse<Seat[]>;
      
      if (res.success && res.data) {
        // Nếu data rỗng hoặc toàn bộ seat là "hidden", khởi tạo grid mới
        if (
          res.data.length === 0 ||
          res.data.every((s) => s.type === "hidden")
        ) {
          setSeats([]);
        } else {
          const mapped = res.data.map((s, i) => ({
            ...s,
            id: s.id || i,
          }));
          setSeats(mapped);
        }
      }
    } catch (error) {
      console.error("Failed to fetch seats:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (isOpen && roomId) {
      fetchSeats();
    }
  }, [isOpen, roomId, fetchSeats]);

  const handleSave = async () => {
    if (!roomId) return;
    try {
      setSaving(true);
      const payload = {
        seats: seats.map((s) => ({
          id: s.id,
          x: s.x,
          y: s.y,
          angle: s.angle,
        })),
      };
      const res = await apiClient.put<ApiResponse<void>>(
        `/admin/rooms/${roomId}/seats/layout`,
        payload,
      ) as unknown as ApiResponse<void>;
      
      if (res.success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save layout:", error);
      alert("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const getSVGPoint = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgPt.x, y: svgPt.y };
  };

  const handleMouseDown = (e: React.MouseEvent, id?: number) => {
    e.stopPropagation(); 
    const pt = getSVGPoint(e);
    setLastMousePos(pt);

    if (id !== undefined) {
      setDraggedSeatId(id);
      if (!selectedIds.includes(id)) {
        if (e.ctrlKey || e.shiftKey) {
          setSelectedIds((prev) => [...prev, id]);
        } else {
          setSelectedIds([id]);
        }
      }
    } else {
      if (!e.ctrlKey && !e.shiftKey) {
        setSelectedIds([]);
      }
      setMarquee({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e);

    if (draggedSeatId !== null) {
      const dx = pt.x - lastMousePos.x;
      const dy = pt.y - lastMousePos.y;

      setSeats((prev) =>
        prev.map((s) => {
          if (selectedIds.includes(s.id)) {
            const nx = s.x + dx;
            const ny = s.y + dy;
            return { ...s, x: nx, y: ny };
          }
          return s;
        }),
      );
      setLastMousePos(pt);
    } else if (marquee) {
      setMarquee((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
    }
  };

  const handleMouseUp = () => {
    if (marquee) {
      const xMin = Math.min(marquee.x1, marquee.x2);
      const xMax = Math.max(marquee.x1, marquee.x2);
      const yMin = Math.min(marquee.y1, marquee.y2);
      const yMax = Math.max(marquee.y1, marquee.y2);

      const newlySelected = seats
        .filter((s) => s.x >= xMin && s.x <= xMax && s.y >= yMin && s.y <= yMax)
        .map((s) => s.id);

      setSelectedIds((prev) => {
        const set = new Set([...prev, ...newlySelected]);
        return Array.from(set);
      });
      setMarquee(null);
    }

    if (draggedSeatId !== null && isSnapEnabled) {
      setSeats((prev) =>
        prev.map((s) => {
          if (selectedIds.includes(s.id)) {
            return {
              ...s,
              x: Math.round(s.x / 20) * 20,
              y: Math.round(s.y / 20) * 20,
            };
          }
          return s;
        }),
      );
    }

    setDraggedSeatId(null);
  };

  const rotateSelected = (delta: number) => {
    setSeats((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, angle: (s.angle + delta) % 360 }
          : s,
      ),
    );
  };

  const alignHorizontal = () => {
    if (selectedIds.length < 2) return;
    const selectedSeats = seats.filter((s) => selectedIds.includes(s.id));
    const avgY = selectedSeats.reduce((acc, s) => acc + s.y, 0) / selectedSeats.length;
    setSeats((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, y: Math.round(avgY / 20) * 20 }
          : s,
      ),
    );
  };

  const alignVertical = () => {
    if (selectedIds.length < 2) return;
    const selectedSeats = seats.filter((s) => selectedIds.includes(s.id));
    const avgX = selectedSeats.reduce((acc, s) => acc + s.x, 0) / selectedSeats.length;
    setSeats((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, x: Math.round(avgX / 20) * 20 }
          : s,
      ),
    );
  };

  const autoGridLayout = () => {
    if (seats.length === 0) return;
    const cols = 15;
    const spacingX = 50;
    const spacingY = 50;
    const startX = 150;
    const startY = 150;

    setSeats((prev) =>
      prev.map((s, i) => ({
        ...s,
        x: startX + (i % cols) * spacingX,
        y: startY + Math.floor(i / cols) * spacingY,
        angle: 0,
      })),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Move className="w-5 h-5 text-red-500" />
                Thiết kế Sơ đồ ghế (v3.1)
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Chọn {selectedIds.length} ghế •{" "}
                {isSnapEnabled ? "Snap ON" : "Snap OFF"}
              </p>
            </div>

            {selectedIds.length > 1 && (
              <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-xl border border-white/5">
                <button
                  onClick={alignHorizontal}
                  className="px-3 py-1.5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold rounded-lg transition-colors border border-transparent hover:border-white/10"
                >
                  Căn Ngang
                </button>
                <button
                  onClick={alignVertical}
                  className="px-3 py-1.5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold rounded-lg transition-colors border border-transparent hover:border-white/10"
                >
                  Căn Dọc
                </button>
                <div className="w-[1px] h-4 bg-zinc-700 mx-1"></div>
                <button
                  onClick={() => rotateSelected(15)}
                  className="p-1.5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors"
                  title="Xoay 15°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={autoGridLayout}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold rounded-xl border border-blue-500/30 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Xếp Lưới Tự Động
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSnapEnabled}
                onChange={() => setIsSnapEnabled(!isSnapEnabled)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
              />
              <span className="text-xs text-zinc-400 font-medium">
                Hít lưới
              </span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Lưu bản vẽ
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10"
            >
              <X className="w-6 h-6 text-zinc-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[#0c0c0c] relative h-full">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox="0 0 1000 800"
              className="w-full h-full select-none cursor-crosshair"
              onMouseDown={(e) => handleMouseDown(e)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <linearGradient
                  id="screenGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 200,60 Q 500,30 800,60"
                fill="none"
                stroke="url(#screenGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x="500"
                y="55"
                textAnchor="middle"
                fill="#333"
                className="text-[12px] font-black uppercase tracking-[1em]"
              >
                Màn Hình
              </text>

              {marquee && (
                <rect
                  x={Math.min(marquee.x1, marquee.x2)}
                  y={Math.min(marquee.y1, marquee.y2)}
                  width={Math.abs(marquee.x2 - marquee.x1)}
                  height={Math.abs(marquee.y2 - marquee.y1)}
                  className="fill-blue-500/10 stroke-blue-500 stroke-1"
                  strokeDasharray="4 4"
                />
              )}

              {seats.map((seat) => {
                const isSelected = selectedIds.includes(seat.id);
                return (
                  <g
                    key={seat.id}
                    transform={`translate(${seat.x}, ${seat.y}) rotate(${seat.angle})`}
                    onMouseDown={(e) => handleMouseDown(e, seat.id)}
                    className={`cursor-grab active:cursor-grabbing group ${draggedSeatId === seat.id ? "opacity-70" : ""}`}
                  >
                    <rect
                      x="-16"
                      y="-16"
                      width="32"
                      height="32"
                      rx="6"
                      className={`fill-zinc-950 stroke-2 transition-all duration-200 ${
                        isSelected
                          ? "stroke-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "stroke-zinc-800 group-hover:stroke-zinc-500"
                      }`}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[9px] font-black select-none transition-colors duration-200 ${
                        isSelected ? "fill-white" : "fill-zinc-600"
                      }`}
                    >
                      {seat.row_char}
                      {seat.seat_number}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div
              className={`bg-zinc-900/90 border border-zinc-800 p-5 rounded-[24px] backdrop-blur-xl shadow-2xl pointer-events-auto transition-all duration-500 overflow-hidden ${
                isControlsCollapsed
                  ? "w-12 h-12 p-0 flex items-center justify-center rounded-full"
                  : "max-w-sm"
              }`}
            >
              {isControlsCollapsed ? (
                <button
                  onClick={() => setIsControlsCollapsed(false)}
                  className="w-full h-full flex items-center justify-center text-red-500 hover:bg-white/5 transition-colors"
                  title="Mở bảng điều khiển"
                >
                  <GripHorizontal className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <GripHorizontal className="w-3.5 h-3.5 text-red-500" />
                      Bảng điều khiển
                    </h4>
                    <button
                      onClick={() => setIsControlsCollapsed(true)}
                      className="p-1 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                      title="Thu gọn"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Kéo thả</span>
                      <span className="text-[10px] text-zinc-300">Di chuyển khối</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Phím tắt</span>
                      <span className="text-[10px] text-zinc-300">Ctrl + Kéo để chọn thêm</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="bg-red-600/10 border border-red-500/20 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-3">
                <span className="text-[10px] font-bold text-red-500">
                  Đã chọn {selectedIds.length} ghế
                </span>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors pointer-events-auto"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
