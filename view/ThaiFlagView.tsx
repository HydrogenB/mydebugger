/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import { Helmet } from "react-helmet";
import { TOOL_PANEL_CLASS } from "../src/design-system/foundations/layout";
import { Button } from "../src/design-system/components/inputs/Button";
import { OutputFormat, GifEffect } from "../viewmodel/useThaiFlag";

interface Props {
  height: number;
  setHeight: (v: number) => void;
  width: number;
  format: OutputFormat;
  setFormat: (v: OutputFormat) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  gifEffect: GifEffect;
  setGifEffect: (v: GifEffect) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  svg: string;
  download: () => void;
}

const ThaiFlagView: React.FC<Props> = ({
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
}) => {
  const pageTitle = "สร้างธงชาติไทย (Thai National Flag Generator)";
  const pageDescription =
    "สร้างธงชาติไทยขนาดตามต้องการ พร้อมดาวน์โหลดเป็น PNG, SVG, JPEG หรือ GIF แบบเคลื่อนไหว";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Thai Flag Generator",
    applicationCategory: "GraphicsApplication",
    operatingSystem: "All",
    description: pageDescription,
  };

  return (
    <div className={`${TOOL_PANEL_CLASS} mx-auto max-w-screen-md`}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="/thong-thai-og.svg" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">
        ธงชาติไทย – สร้างธงและดาวน์โหลดฟรี
      </h1>
      <div className="space-y-4">
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block mb-1 text-sm font-medium">
            ความสูงของธง (px)
          </label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={10}
          />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block mb-1 text-sm font-medium">รูปแบบไฟล์</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="svg">SVG</option>
            <option value="gif">GIF</option>
          </select>
        </div>
        {format === "gif" && (
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="block mb-1 text-sm font-medium">
              เอฟเฟกต์ GIF
            </label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={gifEffect}
              onChange={(e) => setGifEffect(e.target.value as GifEffect)}
            >
              <option value="wave">Wave</option>
              <option value="pulse">Pulse</option>
              <option value="fade">Fade</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </div>
        )}
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block mb-1 text-sm font-medium">สีพื้นหลัง</label>
          <input
            type="color"
            className="border rounded w-full h-10"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <div
          className="border flex items-center justify-center"
          style={{ backgroundColor }}
        >
          {format === "svg" ? (
            <div
              style={{ width, height }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <canvas ref={canvasRef} style={{ width, height }} />
          )}
        </div>
        <Button onClick={download} className="sticky bottom-4">
          ดาวน์โหลด
        </Button>
      </div>
    </div>
  );
};

export default ThaiFlagView;
