// Device profiles for Puppeteer-based deep link detection
// Contains user agents, viewport settings, and other device-specific configurations

const deviceProfiles = {
  ios_app: {
    name: 'iOS + App Installed',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    },
    // Pretend app is installed for testing purposes
    hasApp: true,
    appScheme: 'trueapp://' // Will be overridden by user input
  },
  ios_noapp: {
    name: 'iOS + No App',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    },
    hasApp: false,
    expectedPattern: /^https:\/\/apps\.apple\.com\//
  },
  android_app: {
    name: 'Android + App Installed',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    viewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 2.6,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    },
    hasApp: true,
    appScheme: 'trueapp://', // Will be overridden by user input
    // Also look for intent:// scheme which is common for Android
    intentScheme: true
  },
  android_noapp: {
    name: 'Android + No App',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    viewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 2.6,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    },
    hasApp: false,
    expectedPattern: /^https:\/\/play\.google\.com\//
  },
  desktop: {
    name: 'Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    viewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true
    },
    hasApp: false,
    expectedPattern: /^https:\/\/(www\.)?true\.th\//
  }
};

export default deviceProfiles;