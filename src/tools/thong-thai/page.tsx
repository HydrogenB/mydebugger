/**
 * Thai Flag Animation Studio — Compact & Pro
 * - Crisp DPR rendering + seamless stripe edges
 * - Fullscreen that truly fills the screen
 * - PNG + GIF export (gif.js via CDN)
 * - Advanced settings hidden behind an <details> accordion
 * MIT License
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";

// ---- Types ------------------------------------------------------------------
interface AnimationParameters {
  ampX: number;
  freqX: number;
  ampY: number;
  freqY: number;
  speed: number;
  windStrength: number;
  windDirection: number;
  turbulence: number;
  fabricStiffness: number;
  gravity: number;
}

interface FlagColors {
  red: string;
  white: string;
  blue: string;
}

declare global {
  interface Window {
    GIF: any;
  }
}

// ---- Constants ---------------------------------------------------------------
const ASPECT_RATIO = 3 / 2;
const OFFICIAL: FlagColors = { red: "#A51931", white: "#FFFFFF", blue: "#2D2A4A" };
const GIF_CDN = "https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/";

// ---- Utilities ---------------------------------------------------------------
const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

const ensureGifLib = async () => {
  if ((window as any).GIF) return;
  await loadScript(GIF_CDN + "gif.js");
};

// Small texture generator
const createFabricTexture = (type: "none" | "silk" | "cotton" | "satin"): HTMLCanvasElement => {
  const c = document.createElement("canvas");
  c.width = 100;
  c.height = 100;
  const t = c.getContext("2d")!;
  t.clearRect(0, 0, 100, 100);

  switch (type) {
    case "silk":
      for (let i = 0; i < 100; i++) {
        t.strokeStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        t.beginPath();
        t.moveTo(Math.random() * 100, 0);
        t.lineTo(Math.random() * 100, 100);
        t.stroke();
      }
      break;
    case "cotton":
      for (let i = 0; i < 500; i++) {
        t.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
        t.fillRect(Math.random() * 100, Math.random() * 100, 2, 2);
      }
      break;
    case "satin": {
      const g = t.createLinearGradient(0, 0, 100, 100);
      g.addColorStop(0, "rgba(255,255,255,0.12)");
      g.addColorStop(0.5, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(255,255,255,0.12)");
      t.fillStyle = g;
      t.fillRect(0, 0, 100, 100);
      break;
    }
    default:
      break;
  }
  return c;
};

// ---- Component ---------------------------------------------------------------
const ThaiFlagStudio: React.FC = () => {
  // Basic UI
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [bgColor, setBgColor] = useState("#101321");
  const [colorScheme, setColorScheme] = useState<"official" | "custom">("official");
  const [customColors, setCustomColors] = useState<FlagColors>(OFFICIAL);

  // Dimensions
  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(Math.round(600 * ASPECT_RATIO));
  const [lockAspect, setLockAspect] = useState(true);

  // Animation params (basic)
  const [windStrength, setWindStrength] = useState(0.35);
  const [speed, setSpeed] = useState(1.0);

  // Advanced (in accordion)
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [params, setParams] = useState<AnimationParameters>({
    ampX: 20,
    freqX: 0.028,
    ampY: 14,
    freqY: 0.015,
    speed: 1.0,
    windStrength: 0.35,
    windDirection: 0,
    turbulence: 0.12,
    fabricStiffness: 0.45,
    gravity: 0.12
  });
  const [fabric, setFabric] = useState<"none" | "silk" | "cotton" | "satin">("satin");
  const [lightingAngle, setLightingAngle] = useState(30);
  const [lightingIntensity, setLightingIntensity] = useState(0.45);
  const [dropShadow, setDropShadow] = useState(true);
  const [glow, setGlow] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState<"flag" | "pole" | "outdoor">("flag");

  // Export
  const [exportWidth, setExportWidth] = useState(1920);
  const exportHeight = useMemo(() => Math.round(exportWidth / ASPECT_RATIO), [exportWidth]);

  // GIF
  const [gifDuration, setGifDuration] = useState(3); // seconds
  const [gifFps, setGifFps] = useState(20);
  const [gifQuality, setGifQuality] = useState(12); // gif.js quality (lower = better)
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);

  // Refs / canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isFullscreen = useRef(false);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Keep two-way binding between basic sliders and params
  useEffect(() => {
    setParams((p) => ({ ...p, windStrength, speed }));
  }, [windStrength, speed]);

  // Aspect ratio lock
  useEffect(() => {
    if (lockAspect) setWidth(Math.round(height * ASPECT_RATIO));
  }, [height, lockAspect]);

  // Fullscreen change tracking
  useEffect(() => {
    const onFsChange = () => (isFullscreen.current = !!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    // @ts-ignore Safari
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      // @ts-ignore
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  const colors: FlagColors = colorScheme === "custom" ? customColors : OFFICIAL;

  // ---- Draw ------------------------------------------------------------------
  const drawFlag = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, drawWidth: number, drawHeight: number) => {
      const { ampX, ampY, freqX, freqY, speed, windStrength, windDirection, turbulence, fabricStiffness, gravity } =
        params;

      // Background
      ctx.clearRect(0, 0, drawWidth, drawHeight);
      if (viewMode === "outdoor") {
        const sky = ctx.createLinearGradient(0, 0, 0, drawHeight);
        sky.addColorStop(0, theme === "dark" ? "#0f1419" : "#87CEEB");
        sky.addColorStop(1, theme === "dark" ? "#1a1a2e" : "#98D8F4");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, drawWidth, drawHeight);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, drawWidth, drawHeight);
      }

      // Pole if needed
      const flagOffsetX = viewMode !== "flag" ? 60 : 0;
      const flagWidth = drawWidth - flagOffsetX;
      if (viewMode !== "flag") {
        ctx.save();
        const poleGradient = ctx.createLinearGradient(20, 0, 40, 0);
        poleGradient.addColorStop(0, "#8B7355");
        poleGradient.addColorStop(0.5, "#D2B48C");
        poleGradient.addColorStop(1, "#8B7355");
        ctx.fillStyle = poleGradient;
        ctx.fillRect(20, 0, 20, drawHeight);
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(30, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Wave function (uses absolute Y -> no seams)
      const waveAt = (x: number, baseY: number) => {
        const relX = x / flagWidth;
        const yNorm = baseY / drawHeight;
        const p1 = Math.sin(relX * freqX * 100 + time * speed) * ampX;
        const p2 = Math.cos(relX * freqY * 50 + time * speed * 0.7) * ampY;
        const turb = turbulence * Math.sin(relX * 10 + time * 3) * 10;
        const wind = windStrength * Math.sin(relX * Math.PI) * 30 * Math.cos((windDirection * Math.PI) / 180);
        const g = gravity * yNorm * 20;
        const stiff = 1 - fabricStiffness * 0.5;
        return (p1 + p2 + turb + wind) * stiff + g;
      };

      const step = Math.max(1, Math.round(flagWidth / 900));

      // Clip the flag area and draw without shadow to avoid edge bleed
      ctx.save();
      ctx.beginPath();
      ctx.rect(flagOffsetX - 1, -1, flagWidth + 2, drawHeight + 2);
      ctx.clip();

      // Stripes data (1:1:2:1:1)
      const ratios = [1, 1, 2, 1, 1];
      const total = ratios.reduce((a, b) => a + b, 0);
      const stripeColors = [colors.red, colors.white, colors.blue, colors.white, colors.red];

      let y0 = 0;
      for (let i = 0; i < stripeColors.length; i++) {
        const top = y0;
        const bottom = y0 + (drawHeight / total) * ratios[i];

        ctx.beginPath();
        for (let x = 0; x <= flagWidth; x += step) {
          const y = top + waveAt(x, top);
          if (x === 0) ctx.moveTo(flagOffsetX, y);
          else ctx.lineTo(flagOffsetX + x, y);
        }
        for (let x = flagWidth; x >= 0; x -= step) {
          const y = bottom + waveAt(x, bottom);
          ctx.lineTo(flagOffsetX + x, y);
        }
        ctx.closePath();

        // base fill
        ctx.fillStyle = stripeColors[i];
        ctx.fill();

        // fabric texture overlay
        if (fabric !== "none") {
          const pattern = ctx.createPattern(createFabricTexture(fabric), "repeat");
          if (pattern) {
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = pattern;
            ctx.fill();
            ctx.restore();
          }
        }

        // lighting overlay
        if (lightingIntensity > 0) {
          const lg = ctx.createLinearGradient(
            flagOffsetX,
            top,
            flagOffsetX + flagWidth * Math.cos((lightingAngle * Math.PI) / 180),
            top + (bottom - top) * Math.sin((lightingAngle * Math.PI) / 180)
          );
          lg.addColorStop(0, `rgba(255,255,255,${lightingIntensity * 0.3})`);
          lg.addColorStop(0.5, `rgba(255,255,255,0)`);
          lg.addColorStop(1, `rgba(0,0,0,${lightingIntensity * 0.2})`);
          ctx.fillStyle = lg;
          ctx.fill();
        }

        y0 = bottom;
      }

      ctx.restore(); // end clip

      // Shadow / glow around whole flag
      if (dropShadow || glow) {
        ctx.save();
        ctx.shadowColor = glow ? "rgba(255,215,0,0.55)" : "rgba(0,0,0,0.45)";
        ctx.shadowBlur = glow ? 30 : 22;
        ctx.shadowOffsetX = glow ? 0 : 12;
        ctx.shadowOffsetY = glow ? 0 : 16;
        ctx.fillStyle = "rgba(0,0,0,0.001)";
        ctx.fillRect(flagOffsetX, 0, flagWidth, drawHeight);
        ctx.restore();
      }

      // Grid (debug)
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        for (let x = 0; x < drawWidth; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, drawHeight);
          ctx.stroke();
        }
        for (let y = 0; y < drawHeight; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(drawWidth, y);
          ctx.stroke();
        }
        ctx.restore();
      }
    },
    [
      params,
      colors,
      fabric,
      lightingAngle,
      lightingIntensity,
      dropShadow,
      glow,
      showGrid,
      bgColor,
      viewMode,
      theme
    ]
  );

  // ---- Animation loop with DPR scaling --------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext("2d")!;

    let last = performance.now();

    const render = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      timeRef.current += dt;

      const rect = container.getBoundingClientRect();
      const cssW = rect.width || width;
      const cssH = rect.height || height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(cssW * dpr);
      const bh = Math.round(cssH * dpr);

      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      drawFlag(ctx, timeRef.current, cssW, cssH);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, drawFlag]);

  // ---- Fullscreen ------------------------------------------------------------
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {}
    } else {
      try {
        await el.requestFullscreen();
      } catch {}
    }
  }, []);

  // ---- Export: PNG -----------------------------------------------------------
  const downloadPNG = useCallback(() => {
    const temp = document.createElement("canvas");
    temp.width = exportWidth;
    temp.height = exportHeight;
    const tctx = temp.getContext("2d")!;
    drawFlag(tctx, timeRef.current, exportWidth, exportHeight);
    temp.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thai-flag-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png", 1);
  }, [drawFlag, exportWidth, exportHeight]);

  // ---- Export: GIF (gif.js) --------------------------------------------------
  const downloadGIF = useCallback(async () => {
    try {
      setIsEncoding(true);
      setEncodeProgress(0);
      await ensureGifLib();

      const frames = Math.max(1, Math.floor(gifDuration * gifFps));
      const delay = Math.round(1000 / gifFps);

      const temp = document.createElement("canvas");
      temp.width = exportWidth;
      temp.height = exportHeight;
      const tctx = temp.getContext("2d")!;

      const gif = new window.GIF({
        workers: 2,
        workerScript: GIF_CDN + "gif.worker.js",
        quality: gifQuality, // lower is better quality
        width: exportWidth,
        height: exportHeight
      });

      gif.on("progress", (p: number) => setEncodeProgress(Math.round(p * 100)));
      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `thai-flag-${Date.now()}.gif`;
        a.click();
        URL.revokeObjectURL(url);
        setIsEncoding(false);
      });

      // Capture by re-drawing frames with fixed time step for stability
      const start = timeRef.current;
      const stepT = 1 / gifFps;

      for (let i = 0; i < frames; i++) {
        const t = start + i * stepT;
        drawFlag(tctx, t, exportWidth, exportHeight);
        gif.addFrame(temp, { copy: true, delay });
      }

      gif.render();
    } catch (e) {
      console.error(e);
      setIsEncoding(false);
      alert("GIF encoding failed. Check console for details.");
    }
  }, [gifDuration, gifFps, gifQuality, exportWidth, exportHeight, drawFlag]);

  // ---- UI --------------------------------------------------------------------
  const textColor = theme === "dark" ? "#f0f0f0" : "#333";
  const cardBg = theme === "dark" ? "#1e1e30" : "#ffffff";
  const pageBg =
    theme === "dark"
      ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)"
      : "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)";

  return (
    <>
      <Helmet>
        <title>Thai Flag Animation Studio</title>
        <meta name="description" content="Create animated Thai flags with physics & export to PNG/GIF" />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          color: textColor,
          padding: "2rem",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "2.6rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem"
              }}
            >
              🇹🇭 Thai Flag Animation Studio
            </h1>
            <p style={{ opacity: 0.8 }}>Professional waving flag renderer. Export as PNG or GIF.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "2rem" }}>
            {/* Control Panel */}
            <div
              style={{
                background: cardBg,
                borderRadius: 20,
                padding: "1.5rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", fontWeight: 700 }}>Controls</h2>

              {/* Quick settings */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: 6 }}>Theme</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setTheme("dark")}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: 10,
                      border: "1px solid #444",
                      background: theme === "dark" ? "#2b2b43" : "#f0f0f0",
                      color: textColor,
                      cursor: "pointer"
                    }}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      borderRadius: 10,
                      border: "1px solid #ccc",
                      background: theme === "light" ? "#fafafa" : "#2a2a3e",
                      color: theme === "light" ? "#333" : "#eee",
                      cursor: "pointer"
                    }}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: 6 }}>Background</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 60, height: 36, border: "1px solid #444", borderRadius: 8, background: "transparent" }}
                />
              </div>

              {/* Dimensions */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Dimensions</h3>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", marginBottom: 4 }}>Height: {height}px</label>
                  <input type="range" min={200} max={1600} value={height} onChange={(e) => setHeight(+e.target.value)} style={{ width: "100%" }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} /> Lock Aspect (3:2)
                </label>
                {!lockAspect && (
                  <div>
                    <label style={{ display: "block", marginBottom: 4 }}>Width: {width}px</label>
                    <input type="range" min={300} max={2400} value={width} onChange={(e) => setWidth(+e.target.value)} style={{ width: "100%" }} />
                  </div>
                )}
              </div>

              {/* Basic Physics */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Motion</h3>
                <label style={{ display: "block", marginBottom: 4 }}>Wind Strength: {(windStrength * 100).toFixed(0)}%</label>
                <input type="range" min={0} max={1} step={0.01} value={windStrength} onChange={(e) => setWindStrength(+e.target.value)} style={{ width: "100%" }} />

                <label style={{ display: "block", margin: "10px 0 4px" }}>Speed: {speed.toFixed(1)}x</label>
                <input type="range" min={0} max={4} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} style={{ width: "100%" }} />
              </div>

              {/* Colors */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Colors</h3>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as any)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: "1px solid #444", marginBottom: 8, background: "transparent", color: textColor }}
                >
                  <option value="official">Official (มาตรฐาน)</option>
                  <option value="custom">Custom</option>
                </select>
                {colorScheme === "custom" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="color" value={customColors.red} onChange={(e) => setCustomColors((p) => ({ ...p, red: e.target.value }))} style={{ width: 50, height: 32 }} />
                    <input type="color" value={customColors.white} onChange={(e) => setCustomColors((p) => ({ ...p, white: e.target.value }))} style={{ width: 50, height: 32 }} />
                    <input type="color" value={customColors.blue} onChange={(e) => setCustomColors((p) => ({ ...p, blue: e.target.value }))} style={{ width: 50, height: 32 }} />
                  </div>
                )}
              </div>

              {/* Advanced Accordion */}
              <details open={advancedOpen} onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}>
                <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>Advanced</summary>
                <div style={{ paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                  <label style={{ display: "block", marginBottom: 4 }}>Wind Direction: {params.windDirection}°</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={params.windDirection}
                    onChange={(e) => setParams((p) => ({ ...p, windDirection: +e.target.value }))}
                    style={{ width: "100%", marginBottom: 10 }}
                  />

                  <label style={{ display: "block", marginBottom: 4 }}>Turbulence: {(params.turbulence * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.turbulence}
                    onChange={(e) => setParams((p) => ({ ...p, turbulence: +e.target.value }))}
                    style={{ width: "100%", marginBottom: 10 }}
                  />

                  <label style={{ display: "block", marginBottom: 4 }}>Fabric Stiffness: {(params.fabricStiffness * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.fabricStiffness}
                    onChange={(e) => setParams((p) => ({ ...p, fabricStiffness: +e.target.value }))}
                    style={{ width: "100%", marginBottom: 10 }}
                  />

                  <label style={{ display: "block", marginBottom: 4 }}>Gravity: {(params.gravity * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.gravity}
                    onChange={(e) => setParams((p) => ({ ...p, gravity: +e.target.value }))}
                    style={{ width: "100%", marginBottom: 10 }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 4 }}>ampX: {params.ampX.toFixed(0)}</label>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={params.ampX}
                        onChange={(e) => setParams((p) => ({ ...p, ampX: +e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 4 }}>ampY: {params.ampY.toFixed(0)}</label>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={params.ampY}
                        onChange={(e) => setParams((p) => ({ ...p, ampY: +e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 4 }}>freqX: {params.freqX.toFixed(3)}</label>
                      <input
                        type="range"
                        min={0.005}
                        max={0.08}
                        step={0.001}
                        value={params.freqX}
                        onChange={(e) => setParams((p) => ({ ...p, freqX: +e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 4 }}>freqY: {params.freqY.toFixed(3)}</label>
                      <input
                        type="range"
                        min={0.005}
                        max={0.08}
                        step={0.001}
                        value={params.freqY}
                        onChange={(e) => setParams((p) => ({ ...p, freqY: +e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <label style={{ display: "block", marginBottom: 6 }}>Fabric</label>
                  <select
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value as any)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: "1px solid #444", background: "transparent", color: textColor }}
                  >
                    <option value="none">None</option>
                    <option value="silk">Silk</option>
                    <option value="cotton">Cotton</option>
                    <option value="satin">Satin</option>
                  </select>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Lighting Angle: {lightingAngle}°</label>
                    <input type="range" min={0} max={180} value={lightingAngle} onChange={(e) => setLightingAngle(+e.target.value)} style={{ width: "100%" }} />
                    <label style={{ display: "block", margin: "10px 0 4px" }}>Lighting Intensity: {(lightingIntensity * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={lightingIntensity}
                      onChange={(e) => setLightingIntensity(+e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" checked={dropShadow} onChange={(e) => setDropShadow(e.target.checked)} /> Shadow
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" checked={glow} onChange={(e) => setGlow(e.target.checked)} /> Glow
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} /> Grid
                    </label>
                    <div>
                      <label style={{ display: "block", marginBottom: 4 }}>View</label>
                      <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as any)}
                        style={{ width: "100%", padding: "0.4rem", borderRadius: 8, border: "1px solid #444", background: "transparent", color: textColor }}
                      >
                        <option value="flag">Flag Only</option>
                        <option value="pole">With Pole</option>
                        <option value="outdoor">Outdoor Scene</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Export */}
              <div style={{ marginTop: 18 }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Export</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 4 }}>Width</label>
                    <input
                      type="number"
                      min={600}
                      max={3840}
                      value={exportWidth}
                      onChange={(e) => setExportWidth(Math.max(600, Math.min(3840, +e.target.value || 600)))}
                      style={{ width: "100%", padding: "0.4rem", borderRadius: 8, border: "1px solid #444", background: "transparent", color: textColor }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 4 }}>Height</label>
                    <input
                      type="text"
                      value={`${exportHeight} (auto)`}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: 8,
                        border: "1px solid #444",
                        background: "#1f2438",
                        color: "#98a2b3"
                      }}
                    />
                  </div>
                </div>

                <details>
                  <summary style={{ cursor: "pointer", marginBottom: 6 }}>GIF options</summary>
                  <div style={{ paddingTop: 8 }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Duration: {gifDuration}s</label>
                    <input type="range" min={1} max={8} value={gifDuration} onChange={(e) => setGifDuration(+e.target.value)} style={{ width: "100%" }} />
                    <label style={{ display: "block", margin: "10px 0 4px" }}>FPS: {gifFps}</label>
                    <input type="range" min={8} max={30} value={gifFps} onChange={(e) => setGifFps(+e.target.value)} style={{ width: "100%" }} />
                    <label style={{ display: "block", margin: "10px 0 4px" }}>Quality (gif.js): {gifQuality}</label>
                    <input type="range" min={1} max={30} value={gifQuality} onChange={(e) => setGifQuality(+e.target.value)} style={{ width: "100%" }} />
                    {isEncoding && (
                      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                        Encoding… {encodeProgress}% (stay on page)
                      </div>
                    )}
                  </div>
                </details>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={downloadPNG}
                    style={{ flex: 1, padding: "0.7rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}
                  >
                    📸 Download PNG
                  </button>
                  <button
                    onClick={downloadGIF}
                    disabled={isEncoding}
                    style={{
                      flex: 1,
                      padding: "0.7rem",
                      background: isEncoding ? "#6b7280" : "#8b5cf6",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      cursor: isEncoding ? "not-allowed" : "pointer",
                      fontWeight: 600
                    }}
                  >
                    {isEncoding ? "Encoding…" : "🎞️ Download GIF"}
                  </button>
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "0.7rem",
                  background: theme === "dark" ? "#f0f0f0" : "#333333",
                  color: theme === "dark" ? "#333333" : "#f0f0f0",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            {/* Canvas Stage */}
            <div
              ref={containerRef}
              style={{
                background: cardBg,
                borderRadius: 20,
                padding: "1.5rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: 12,
                  cursor: "zoom-in",
                  display: "block"
                }}
                onDoubleClick={toggleFullscreen}
                title="Double-click to toggle fullscreen"
              />
              <button
                onClick={toggleFullscreen}
                style={{
                  position: "absolute",
                  top: "0.8rem",
                  right: "0.8rem",
                  padding: "0.45rem 0.55rem",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  lineHeight: 1
                }}
                title="Toggle fullscreen"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThaiFlagStudio;
