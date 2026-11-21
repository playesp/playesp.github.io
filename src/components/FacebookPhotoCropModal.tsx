import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Move,
  Upload,
} from 'lucide-react';
import { showToast } from '../services/toast.ts';

export interface FacebookPhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  kind: 'avatar' | 'cover';
  title?: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
  onChangeFile?: (newFile: File) => void;
}

// Render image rotated by 0/90/180/270 degrees into a local offscreen canvas
function buildRotatedImageCanvas(img: HTMLImageElement, rotationDeg: number): HTMLCanvasElement {
  const rad = ((rotationDeg % 360) * Math.PI) / 180;
  const swap = rotationDeg % 180 !== 0;
  const cw = swap ? img.naturalHeight || img.height : img.naturalWidth || img.width;
  const ch = swap ? img.naturalWidth || img.width : img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cw);
  canvas.height = Math.max(1, ch);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(
      img,
      -(img.naturalWidth || img.width) / 2,
      -(img.naturalHeight || img.height) / 2
    );
  }
  return canvas;
}

export const FacebookPhotoCropModal: React.FC<FacebookPhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  kind,
  title,
  onCancel,
  onConfirm,
  onChangeFile,
}) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    origOffsetX: number;
    origOffsetY: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    origOffsetX: 0,
    origOffsetY: 0,
  });

  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [frameSize, setFrameSize] = useState<{ w: number; h: number }>({
    w: kind === 'avatar' ? 280 : 380,
    h: kind === 'avatar' ? 280 : 214,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Measure frame container dimensions dynamically
  const updateFrameMeasure = useCallback(() => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setFrameSize({ w: rect.width, h: rect.height });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(updateFrameMeasure, 30);
    window.addEventListener('resize', updateFrameMeasure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateFrameMeasure);
    };
  }, [isOpen, kind, updateFrameMeasure]);

  // Load image cleanly and reset transform state
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    setLoadError(null);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });

    const img = new Image();
    if (!imageSrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      loadedImgRef.current = img;
      setImgSize({
        w: Math.max(1, img.naturalWidth || img.width),
        h: Math.max(1, img.naturalHeight || img.height),
      });
    };
    img.onerror = () => {
      loadedImgRef.current = null;
      setLoadError('यह फोटो क्रॉप के लिए लोड नहीं हो सकी। कृपया गैलरी से दूसरी फोटो चुनें।');
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Effective oriented natural dimensions
  const orientedW = rotation % 180 !== 0 ? imgSize.h : imgSize.w;
  const orientedH = rotation % 180 !== 0 ? imgSize.w : imgSize.h;

  // Minimum cover scale so frame always stays completely filled
  const baseScale =
    orientedW > 0 && orientedH > 0
      ? Math.max(frameSize.w / orientedW, frameSize.h / orientedH)
      : 1;
  const effectiveScale = baseScale * zoom;
  const dispW = orientedW * effectiveScale;
  const dispH = orientedH * effectiveScale;

  const clampOffset = useCallback(
    (nx: number, ny: number, curZoom = zoom, curRot = rotation) => {
      const ow = curRot % 180 !== 0 ? imgSize.h : imgSize.w;
      const oh = curRot % 180 !== 0 ? imgSize.w : imgSize.h;
      if (ow <= 0 || oh <= 0) return { x: 0, y: 0 };
      const bs = Math.max(frameSize.w / ow, frameSize.h / oh);
      const es = bs * curZoom;
      const maxX = Math.max(0, (ow * es - frameSize.w) / 2);
      const maxY = Math.max(0, (oh * es - frameSize.h) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, nx)),
        y: Math.min(maxY, Math.max(-maxY, ny)),
      };
    },
    [imgSize.w, imgSize.h, frameSize.w, frameSize.h, zoom, rotation]
  );

  // Re-clamp offset whenever zoom, rotation, or frame changes
  useEffect(() => {
    setOffset(prev => clampOffset(prev.x, prev.y, zoom, rotation));
  }, [zoom, rotation, frameSize.w, frameSize.h, imgSize.w, imgSize.h, clampOffset]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loadError || orientedW === 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origOffsetX: offset.x,
      origOffsetY: offset.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    setOffset(clampOffset(dragStateRef.current.origOffsetX + dx, dragStateRef.current.origOffsetY + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom(prev => Number(Math.min(3, Math.max(1, prev + delta)).toFixed(2)));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleApplyCrop = () => {
    const img = loadedImgRef.current;
    if (!img || orientedW === 0 || orientedH === 0) {
      showToast('कृपया पहले एक मान्य फोटो चुनें।', 'error');
      return;
    }

    setExporting(true);
    try {
      const sourceCanvas =
        rotation % 360 === 0 ? img : buildRotatedImageCanvas(img, rotation);

      // Output dimensions sized cleanly for crisp avatar/cover quality & fast DB persistence
      const outW = kind === 'avatar' ? 512 : 960;
      const outH = kind === 'avatar' ? 512 : 540;

      const cropDispX = dispW / 2 - frameSize.w / 2 - offset.x;
      const cropDispY = dispH / 2 - frameSize.h / 2 - offset.y;

      const srcX = Math.max(0, cropDispX / effectiveScale);
      const srcY = Math.max(0, cropDispY / effectiveScale);
      const srcW = Math.min(orientedW - srcX, frameSize.w / effectiveScale);
      const srcH = Math.min(orientedH - srcY, frameSize.h / effectiveScale);

      const outCanvas = document.createElement('canvas');
      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) {
        onConfirm(imageSrc);
        return;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(sourceCanvas, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

      const dataUrl = outCanvas.toDataURL('image/jpeg', kind === 'avatar' ? 0.86 : 0.82);
      onConfirm(dataUrl);
    } catch {
      showToast(
        'यह बाहरी इमेज क्रॉप करने की अनुमति नहीं देती — कृपया अपने फ़ोन/कंप्यूटर से फोटो अपलोड करें।',
        'error'
      );
    } finally {
      setExporting(false);
    }
  };

  const modalTitle =
    title ||
    (kind === 'avatar'
      ? 'प्रोफाइल फोटो एडजस्ट व क्रॉप (Adjust Profile Picture)'
      : 'कवर फोटो एडजस्ट व क्रॉप (Reposition Cover Photo)');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden text-[#212121] flex flex-col max-h-[94vh]">
        {/* Facebook-style Clean Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">{modalTitle}</h3>
            <p className="text-[11px] text-slate-500">
              फोटो को खींचकर (Drag) पोज़िशन सेट करें और स्लाइडर से ज़ूम एडजस्ट करें
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Dark Canvas Crop Stage */}
        <div className="bg-slate-950 px-4 py-5 flex flex-col items-center justify-center relative select-none overflow-hidden">
          {loadError ? (
            <div className="py-12 px-4 text-center text-xs text-rose-300 font-bold max-w-xs">
              {loadError}
            </div>
          ) : (
            <div
              ref={frameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheelZoom}
              className={`relative overflow-hidden touch-none cursor-grab active:cursor-grabbing border border-white/25 bg-slate-900 shadow-2xl ${
                kind === 'avatar'
                  ? 'w-64 h-64 sm:w-72 sm:h-72 rounded-xl'
                  : 'w-full max-w-md aspect-[16/9] rounded-xl'
              }`}
            >
              {/* Rendered Photo Layer */}
              {orientedW > 0 && (
                <img
                  src={imageSrc}
                  alt="Crop Preview"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${imgSize.w * effectiveScale}px`,
                    height: `${imgSize.h * effectiveScale}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              )}

              {/* Avatar: Facebook Circular Spotlight Cutout Guide */}
              {kind === 'avatar' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-[86%] h-[86%] rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(2,6,23,0.68)]" />
                </div>
              )}

              {/* Cover: Rule-of-thirds Grid Overlay when dragging or always subtle */}
              {kind === 'cover' && (
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
                    isDragging ? 'opacity-90' : 'opacity-35'
                  }`}
                >
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
                  <div className="absolute inset-0 border-2 border-white/50 rounded-xl" />
                </div>
              )}

              {/* Floating Facebook Drag Hint Pill */}
              <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-xs border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 whitespace-nowrap shadow">
                <Move className="w-3 h-3 text-sky-400" />
                <span>{isDragging ? 'Repositioning...' : 'Drag to Reposition'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Slider + Rotate + Reset Toolbar */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3.5 shrink-0">
          {/* Zoom Bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(z => Number(Math.max(1, z - 0.15).toFixed(2)))}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#1877f2] cursor-pointer h-1.5"
              aria-label="Zoom"
            />

            <button
              type="button"
              onClick={() => setZoom(z => Number(Math.min(3, z + 0.15).toFixed(2)))}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono font-bold text-slate-600 w-10 text-right tabular-nums">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Secondary Tools Row: Rotate / Reset / Change Photo */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#1877f2]" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {onChangeFile && (
              <label className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#1877f2] border border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) onChangeFile(f);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>

          {/* Cancel & Save Crop Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={Boolean(loadError) || exporting || orientedW === 0}
              onClick={handleApplyCrop}
              className="px-5 py-2 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{exporting ? 'Saving...' : 'Save Photo Crop'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
