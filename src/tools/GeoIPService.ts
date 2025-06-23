/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface GeoIpInfo {
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export const fetchGeoIp = async (ip: string): Promise<GeoIpInfo | null> => {
  try {
    const res = await fetch(`https://ip-api.com/json/${ip}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    } as GeoIpInfo;
  } catch {
    return null;
  }
};
