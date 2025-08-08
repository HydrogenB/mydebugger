/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useCallback, useEffect, useRef } from "react";
import gifshot from "gifshot";
import {
  generateThaiFlagSVG,
  getThaiFlagStripes,
  THAI_FLAG_RATIO,
} from "../model/thaiFlag";

export type OutputFormat = "png" | "jpeg" | "svg" | "gif";
export type GifEffect = "wave" | "pulse" | "fade" | "shimmer";

const FRAME_COUNT = 12;

export default function useThaiFlag() {
  const [height, setHeight] = useState<number>(300);
  const width = Math.round(height * THAI_FLAG_RATIO);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [gifEffect, setGifEffect] = useState<GifEffect>("wave");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [svg, setSvg] = useState<string>(() => generateThaiFlagSVG(height));

  const drawFlag = useCallback(
    (ctx: CanvasRenderingContext2D, phase = 0) => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      const { stripes } = getThaiFlagStripes(height);
      stripes.forEach((s, idx) => {
        ctx.fillStyle = s.color;
        if (gifEffect === "wave") {
          const offset = Math.sin(phase + idx) * 5;
          ctx.fillRect(offset, s.y, width, s.height);
        } else {
          ctx.fillRect(0, s.y, width, s.height);
        }
      });
      if (gifEffect === "shimmer") {
        const grad = ctx.createLinearGradient(
          -width + (phase / (2 * Math.PI)) * 2 * width,
          0,
          (phase / (2 * Math.PI)) * 2 * width,
          0,
        );
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(255,255,255,0.4)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      if (gifEffect === "fade") {
        const alpha = 0.5 + 0.5 * Math.sin(phase);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(0, 0, width, height);
      }
      if (gifEffect === "pulse") {
        const scale = 1 + 0.02 * Math.sin(phase);
        const temp = document.createElement("canvas");
        temp.width = width;
        temp.height = height;
        const tctx = temp.getContext("2d");
        if (tctx) {
          tctx.fillStyle = backgroundColor;
          tctx.fillRect(0, 0, width, height);
          stripes.forEach((s) => {
            tctx.fillStyle = s.color;
            tctx.fillRect(0, s.y, width, s.height);
          });
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.scale(scale, scale);
          ctx.drawImage(temp, -width / 2, -height / 2);
          ctx.restore();
        }
      }
    },
    [backgroundColor, gifEffect, height, width],
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFlag(ctx);
  }, [drawFlag, height, width]);

  useEffect(() => {
    setSvg(generateThaiFlagSVG(height));
    drawCanvas();
  }, [height, backgroundColor, drawCanvas]);

  const generateGif = useCallback(async (): Promise<string> => {
    const frames: string[] = [];
    const temp = document.createElement("canvas");
    temp.width = width;
    temp.height = height;
    const ctx = temp.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const phase = (i / FRAME_COUNT) * 2 * Math.PI;
      ctx.clearRect(0, 0, width, height);
      drawFlag(ctx, phase);
      frames.push(temp.toDataURL("image/png"));
    }
    return new Promise((resolve, reject) => {
      gifshot.createGIF(
        { images: frames, gifWidth: width, gifHeight: height, interval: 0.1 },
        (obj: { error: boolean; errorCode?: string; image: string }) => {
          if (!obj.error) resolve(obj.image);
          else reject(new Error(obj.errorCode || "GIF generation failed"));
        },
      );
    });
  }, [drawFlag, height, width]);

  const download = useCallback(async () => {
    if (format === "svg") {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thai-flag.svg";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas();
    if (format === "gif") {
      const gifData = await generateGif();
      const a = document.createElement("a");
      a.href = gifData;
      a.download = "thai-flag.gif";
      a.click();
      return;
    }
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const data = canvas.toDataURL(mime);
    const a = document.createElement("a");
    a.href = data;
    a.download = `thai-flag.${format}`;
    a.click();
  }, [drawCanvas, format, generateGif, svg]);

  return {
    height,
    setHeight,
    width,
    format,
    setFormat,
    backgroundColor,
    setBackgroundColor,
    gifEffect,
    setGifEffect,
    canvasRef,
    svg,
    download,
  } as const;
}
