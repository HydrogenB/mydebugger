/**
 * @fileoverview Enhanced support for previously unsupported functions
 * Comprehensive implementations with full edge case handling
 */

// Enhanced permission handling with full browser support
export interface EnhancedPermissionSupport {
  name: string;
  supported: boolean;
  fallback?: () => Promise<any>;
  browserSpecific?: Record<string, () => Promise<any>>;
}

// Cross-browser compatibility layer
export class BrowserCompatibilityLayer {
  private static instance: BrowserCompatibilityLayer;
  private browserType: string;
  private featureSupport: Map<string, boolean>;

  private constructor() {
    this.browserType = this.detectBrowser();
    this.featureSupport = new Map();
    this.initializeFeatureSupport();
  }

  public static getInstance(): BrowserCompatibilityLayer {
    if (!BrowserCompatibilityLayer.instance) {
      BrowserCompatibilityLayer.instance = new BrowserCompatibilityLayer();
    }
    return BrowserCompatibilityLayer.instance;
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    } else if (userAgent.includes('edge')) {
      return 'edge';
    } else {
      return 'unknown';
    }
  }

  private initializeFeatureSupport(): void {
    // Check feature support
    this.featureSupport.set('serviceWorker', 'serviceWorker' in navigator);
    this.featureSupport.set('pushManager', 'serviceWorker' in navigator && 'pushManager' in navigator.serviceWorker);
    this.featureSupport.set('clipboard', 'clipboard' in navigator);
    this.featureSupport.set('storage', 'storage' in navigator);
    this.featureSupport.set('geolocation', 'geolocation' in navigator);
    this.featureSupport.set('bluetooth', 'bluetooth' in navigator);
    this.featureSupport.set('usb', 'usb' in navigator);
    this.featureSupport.set('serial', 'serial' in navigator);
    this.featureSupport.set('hid', 'hid' in navigator);
    this.featureSupport.set('share', 'share' in navigator);
  }

  public isFeatureSupported(feature: string): boolean {
    return this.featureSupport.get(feature) || false;
  }

  public getBrowserType(): string {
    return this.browserType;
  }

  public getBrowserSpecificImplementation(feature: string): (() => Promise<any>) | undefined {
    const implementations = this.getBrowserSpecificImplementations();
    return implementations[feature]?.[this.browserType];
  }

  private getBrowserSpecificImplementations(): Record<string, Record<string, () => Promise<any>>> {
    return {
      storageAccess: {
        safari: () => document.requestStorageAccess?.() || Promise.reject(new Error('Storage access not supported')),
        chrome: () => Promise.resolve(true), // Chrome handles this automatically
        firefox: () => Promise.resolve(true), // Firefox handles this automatically
      },
      clipboard: {
        safari: () => {
          // Safari-specific clipboard handling
          if ('clipboard' in navigator) {
            return navigator.clipboard.readText();
          }
          return Promise.reject(new Error('Clipboard API not supported'));
        },
        firefox: () => navigator.clipboard.readText(),
        chrome: () => navigator.clipboard.readText(),
      },
    };
  }
}

// Enhanced service worker support
export class EnhancedServiceWorkerSupport {
  private static instance: EnhancedServiceWorkerSupport;
  private registration: ServiceWorkerRegistration | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  public static getInstance(): EnhancedServiceWorkerSupport {
    if (!EnhancedServiceWorkerSupport.instance) {
      EnhancedServiceWorkerSupport.instance = new EnhancedServiceWorkerSupport();
    }
    return EnhancedServiceWorkerSupport.instance;
  }

  public async registerServiceWorker(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported in this browser');
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptURL, options);
      this.retryCount = 0;
      return this.registration;
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await this.delay(1000 * this.retryCount);
        return this.registerServiceWorker(scriptURL, options);
      }
      throw error;
    }
  }

  public async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  public async subscribeToPush(userVisibleOnly = true, applicationServerKey?: Uint8Array): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      return await this.registration.pushManager.subscribe({
        userVisibleOnly,
        applicationServerKey,
      });
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Push notifications permission denied');
      }
      throw error;
    }
  }

  public async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      if ('sync' in this.registration) {
        await this.registration.sync.register(tag);
      } else {
        throw new Error('Background sync not supported');
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }

  public async registerPeriodicSync(tag: string, options: { minInterval: number }): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      if ('periodicSync' in this.registration) {
        await this.registration.periodicSync.register(tag, options);
      } else {
        throw new Error('Periodic background sync not supported');
      }
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced permission handling
export class EnhancedPermissionHandler {
  private static instance: EnhancedPermissionHandler;
  private permissionStates: Map<string, PermissionState> = new Map();

  public static getInstance(): EnhancedPermissionHandler {
    if (!EnhancedPermissionHandler.instance) {
      EnhancedPermissionHandler.instance = new EnhancedPermissionHandler();
    }
    return EnhancedPermissionHandler.instance;
  }

  public async checkPermission(permissionName: string): Promise<PermissionState> {
    if (!('permissions' in navigator)) {
      return 'unsupported' as PermissionState;
    }

    try {
      const result = await navigator.permissions.query({ name: permissionName as any });
      this.permissionStates.set(permissionName, result.state as PermissionState);
      return result.state as PermissionState;
    } catch (error) {
      console.error(`Permission check failed for ${permissionName}:`, error);
      return 'unsupported' as PermissionState;
    }
  }

  public async requestPermission(permission: Permission): Promise<unknown> {
    const browserLayer = BrowserCompatibilityLayer.getInstance();
    
    // Check if feature is supported
    if (!browserLayer.isFeatureSupported(permission.name)) {
      throw new Error(`${permission.name} is not supported in this browser`);
    }

    // Check current permission state
    const currentState = await this.checkPermission(permission.name);
    
    if (currentState === 'denied') {
      throw new Error(`${permission.name} permission denied`);
    }

    if (currentState === 'granted') {
      return await permission.requestFn();
    }

    // Request permission
    try {
      return await permission.requestFn();
    } catch (error) {
      // Provide browser-specific guidance
      const guidance = this.getPermissionGuidance(permission.name);
      throw new Error(`${error.message}. ${guidance}`);
    }
  }

  private getPermissionGuidance(permissionName: string): string {
    const browserLayer = BrowserCompatibilityLayer.getInstance();
    const browserType = browserLayer.getBrowserType();

    const guidanceMap: Record<string, Record<string, string>> = {
      camera: {
        chrome: 'Click the camera icon in the address bar to allow camera access',
        firefox: 'Click the permissions icon in the address bar to allow camera access',
        safari: 'Go to Safari > Settings > Websites > Camera to allow access',
        edge: 'Click the permissions icon in the address bar to allow camera access',
      },
      microphone: {
        chrome: 'Click the microphone icon in the address bar to allow microphone access',
        firefox: 'Click the permissions icon in the address bar to allow microphone access',
        safari: 'Go to Safari > Settings > Websites > Microphone to allow access',
        edge: 'Click the permissions icon in the address bar to allow microphone access',
      },
    };

    return guidanceMap[permissionName]?.[browserType] || 'Check your browser settings to allow this permission';
  }
}

// Enhanced media device handling
export class EnhancedMediaDeviceSupport {
  private static instance: EnhancedMediaDeviceSupport;
  private deviceCache: Map<string, MediaDeviceInfo[]> = new Map();

  public static getInstance(): EnhancedMediaDeviceSupport {
    if (!EnhancedMediaDeviceSupport.instance) {
      EnhancedMediaDeviceSupport.instance = new EnhancedMediaDeviceSupport();
    }
    return EnhancedMediaDeviceSupport.instance;
  }

  public async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      throw new Error('Media devices not supported');
    }

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera/microphone found');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera/microphone already in use');
      }
      throw error;
    }
  }

  public async getDisplayMedia(constraints: DisplayMediaStreamConstraints): Promise<MediaStream> {
    if (!('mediaDevices' in navigator) || !('getDisplayMedia' in navigator.mediaDevices)) {
      throw new Error('Display capture not supported');
    }

    try {
      return await navigator.mediaDevices.getDisplayMedia(constraints);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Display capture permission denied');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No display sources found');
      }
      throw error;
    }
  }

  public async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    if (!('mediaDevices' in navigator) || !('enumerateDevices' in navigator.mediaDevices)) {
      throw new Error('Device enumeration not supported');
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.deviceCache.set('all', devices);
      return devices;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  public async getDevicesByKind(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    const allDevices = await this.enumerateDevices();
    return allDevices.filter(device => device.kind === kind);
  }
}

// Enhanced clipboard handling
export class EnhancedClipboardSupport {
  private static instance: EnhancedClipboardSupport;

  public static getInstance(): EnhancedClipboardSupport {
    if (!EnhancedClipboardSupport.instance) {
      EnhancedClipboardSupport.instance = new EnhancedClipboardSupport();
    }
    return EnhancedClipboardSupport.instance;
  }

  public async readText(): Promise<string> {
    if (!('clipboard' in navigator) || !('readText' in navigator.clipboard)) {
      throw new Error('Clipboard API not supported');
    }

    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Clipboard read permission denied');
      }
      throw error;
    }
  }

  public async writeText(text: string): Promise<void> {
    if (!('clipboard' in navigator) || !('writeText' in navigator.clipboard)) {
      throw new Error('Clipboard API not supported');
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Clipboard write permission denied');
      }
      throw error;
    }
  }

  public async read(): Promise<ClipboardItem[]> {
    if (!('clipboard' in navigator) || !('read' in navigator.clipboard)) {
      throw new Error('Clipboard API not supported');
    }

    try {
      return await navigator.clipboard.read();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Clipboard read permission denied');
      }
      throw error;
    }
  }

  public async write(items: ClipboardItem[]): Promise<void> {
    if (!('clipboard' in navigator) || !('write' in navigator.clipboard)) {
      throw new Error('Clipboard API not supported');
    }

    try {
      await navigator.clipboard.write(items);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Clipboard write permission denied');
      }
      throw error;
    }
  }
}

// Enhanced geolocation handling
export class EnhancedGeolocationSupport {
  private static instance: EnhancedGeolocationSupport;
  private watchId: number | null = null;

  public static getInstance(): EnhancedGeolocationSupport {
    if (!EnhancedGeolocationSupport.instance) {
      EnhancedGeolocationSupport.instance = new EnhancedGeolocationSupport();
    }
    return EnhancedGeolocationSupport.instance;
  }

  public async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  public watchPosition(
    successCallback: PositionCallback,
    errorCallback?: PositionErrorCallback,
    options?: PositionOptions
  ): number {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    return this.watchId;
  }

  public clearWatch(watchId: number): void {
    if (!('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.clearWatch(watchId);
    if (this.watchId === watchId) {
      this.watchId = null;
    }
  }
}

// Enhanced storage handling
export class EnhancedStorageSupport {
  private static instance: EnhancedStorageSupport;

  public static getInstance(): EnhancedStorageSupport {
    if (!EnhancedStorageSupport.instance) {
      EnhancedStorageSupport.instance = new EnhancedStorageSupport();
    }
    return EnhancedStorageSupport.instance;
  }

  public async persist(): Promise<boolean> {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      throw new Error('Storage persistence not supported');
    }

    try {
      return await navigator.storage.persist();
    } catch (error) {
      console.error('Storage persistence failed:', error);
      return false;
    }
  }

  public async persisted(): Promise<boolean> {
    if (!('storage' in navigator) || !('persisted' in navigator.storage)) {
      throw new Error('Storage persistence check not supported');
    }

    try {
      return await navigator.storage.persisted();
    } catch (error) {
      console.error('Storage persistence check failed:', error);
      return false;
    }
  }

  public async estimate(): Promise<StorageEstimate> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      throw new Error('Storage estimation not supported');
    }

    try {
      return await navigator.storage.estimate();
    } catch (error) {
      console.error('Storage estimation failed:', error);
      return { usage: 0, quota: 0 };
    }
  }
}

// Enhanced error handling and recovery
export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private errorLog: Array<{ timestamp: number; error: Error; context: any }> = [];

  public static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler();
    }
    return EnhancedErrorHandler.instance;
  }

  public handleError(error: Error, context?: any): void {
    const errorEntry = {
      timestamp: Date.now(),
      error,
      context,
    };

    this.errorLog.push(errorEntry);
    console.error('Enhanced error handler:', error, context);

    // Limit log size
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
  }

  public getErrorLog(): Array<{ timestamp: number; error: Error; context: any }> {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog.length = 0;
  }

  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError(lastError, { attempt, maxRetries });
          throw lastError;
        }

        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Export all enhanced support classes
export const EnhancedSupport = {
  BrowserCompatibilityLayer,
  EnhancedServiceWorkerSupport,
  EnhancedPermissionHandler,
  EnhancedMediaDeviceSupport,
  EnhancedClipboardSupport,
  EnhancedGeolocationSupport,
  EnhancedStorageSupport,
  EnhancedErrorHandler,
};

// Initialize enhanced support
export const initializeEnhancedSupport = () => {
  console.log('Enhanced support initialized');
  return EnhancedSupport;
};
