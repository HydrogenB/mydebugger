import { getBasicMetadata, getAdvancedMetadata } from "../model/metadata";

describe("getBasicMetadata", () => {
  it("returns core fields", () => {
    const meta = getBasicMetadata({
      navigator: {
        userAgent: "UA",
        platform: "Win32",
        language: "en-US",
        languages: ["en-US", "en"],
        cookieEnabled: true,
        maxTouchPoints: 1,
      } as any,
      screen: { width: 1920, height: 1080 } as any,
      location: { href: "https://example.com" } as any,
      document: { referrer: "https://ref.com" } as any,
      window: { devicePixelRatio: 2 } as any,
    });
    expect(meta.userAgent).toBe("UA");
    expect(meta.platform).toBe("Win32");
    expect(meta.languages).toEqual(["en-US", "en"]);
    expect(meta.screenResolution).toBe("1920x1080");
    expect(meta.devicePixelRatio).toBe(2);
    expect(meta.referrer).toBe("https://ref.com");
    expect(meta.pageUrl).toBe("https://example.com");
  });
});

describe("getAdvancedMetadata", () => {
  it("returns advanced details when available", async () => {
    const nav: any = {
      connection: { effectiveType: "4g", downlink: 1.4 },
      getBattery: () => Promise.resolve({ level: 0.5, charging: true }),
      geolocation: {
        getCurrentPosition: (cb: any) =>
          cb({ coords: { latitude: 1, longitude: 2, accuracy: 3 } }),
      },
    };
    const gl = {
      getExtension: () => null,
      getParameter: () => "GPU",
    } as any;
    const adv = await getAdvancedMetadata({
      navigator: nav,
      screen: {} as any,
      location: {} as any,
      document: {} as any,
      window: {} as any,
      canvas: { getContext: () => gl } as any,
    });
    expect(adv.connectionType).toBe("4g");
    expect(adv.downlink).toBe(1.4);
    expect(adv.battery?.level).toBe(0.5);
    expect(adv.geo?.latitude).toBe(1);
    expect(adv.gpu).toBe("GPU");
    expect(adv.errors).toEqual({});
  });

  it("reports errors when APIs are unavailable", async () => {
    const adv = await getAdvancedMetadata({
      navigator: {} as any,
      screen: {} as any,
      location: {} as any,
      document: {} as any,
      window: {} as any,
      canvas: { getContext: () => null } as any,
    });
    expect(adv.connectionType).toBeUndefined();
    expect(adv.errors.connection).toBeDefined();
    expect(adv.errors.battery).toBeDefined();
    expect(adv.errors.geo).toBeDefined();
    expect(adv.errors.gpu).toBeDefined();
  });
});
