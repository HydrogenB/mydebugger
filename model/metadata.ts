/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Client metadata collection helpers
 */

export interface BasicMetadata {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenResolution: string;
  devicePixelRatio: number;
  timezoneOffset: number;
  timezone: string;
  cookiesEnabled: boolean;
  touchSupport: boolean;
  referrer: string;
  pageUrl: string;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
}

export interface GeoInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AdvancedMetadata {
  connectionType?: string;
  downlink?: number;
  battery?: BatteryInfo;
  geo?: GeoInfo;
  gpu?: string;
}

interface ConnectionLike {
  effectiveType?: string;
  downlink?: number;
}

interface Env {
  navigator: Navigator & {
    connection?: ConnectionLike;
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };
  screen: Screen;
  location: Location;
  document: Document;
  window: Window;
  canvas?: HTMLCanvasElement;
}

const defaultEnv = (): Env => ({
  navigator,
  screen: window.screen,
  location: window.location,
  document,
  window,
});

export const getBasicMetadata = (env: Partial<Env> = {}): BasicMetadata => {
  const e = { ...defaultEnv(), ...env } as Env;
  return {
    userAgent: e.navigator.userAgent,
    platform: e.navigator.platform,
    language: e.navigator.language,
    languages: Array.from(e.navigator.languages),
    screenResolution: `${e.screen.width}x${e.screen.height}`,
    devicePixelRatio: e.window.devicePixelRatio,
    timezoneOffset: new Date().getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: e.navigator.cookieEnabled,
    touchSupport: "ontouchstart" in e.window && e.navigator.maxTouchPoints > 0,
    referrer: e.document.referrer,
    pageUrl: e.location.href,
  };
};

export const getAdvancedMetadata = async (
  env: Partial<Env> = {},
): Promise<AdvancedMetadata> => {
  const e = { ...defaultEnv(), ...env } as Env;
  const adv: AdvancedMetadata = {};

  const conn = e.navigator.connection;
  if (conn) {
    adv.connectionType = conn.effectiveType;
    adv.downlink = conn.downlink;
  }

  if (typeof e.navigator.getBattery === "function") {
    try {
      const battery = await e.navigator.getBattery();
      adv.battery = { level: battery.level, charging: battery.charging };
    } catch {
      // ignore
    }
  }

  if (e.navigator.geolocation?.getCurrentPosition) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        e.navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      adv.geo = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch {
      // user denied
    }
  }

  try {
    const canvas = env.canvas ?? document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (info) {
        const vendor = gl.getParameter(info.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
        adv.gpu = `${vendor} ${renderer}`;
      } else {
        adv.gpu = gl.getParameter((gl as WebGLRenderingContext).RENDERER);
      }
    }
  } catch {
    // ignore
  }

  return adv;
};
