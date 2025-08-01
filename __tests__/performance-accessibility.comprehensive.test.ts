/**
 * © 2025 MyDebugger Contributors – MIT License
 * Performance & Accessibility Comprehensive Tests
 * Tests for performance optimization, accessibility compliance, and user experience
 */

describe('Performance Optimization Tests', () => {
  test('measures function execution time', () => {
    const performanceTimer = {
      measure: <T>(fn: () => T, name?: string): { result: T; duration: number; name?: string } => {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        return { result, duration, name };
      },
      
      measureAsync: async <T>(fn: () => Promise<T>, name?: string): Promise<{ result: T; duration: number; name?: string }> => {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        return { result, duration, name };
      }
    };

    const slowFunction = () => {
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
      return sum;
    };

    const measurement = performanceTimer.measure(slowFunction, 'slow-calculation');
    expect(measurement.result).toBe(499999500000);
    expect(measurement.duration).toBeGreaterThan(0);
    expect(measurement.name).toBe('slow-calculation');
  });

  test('implements efficient data structures', () => {
    // Test efficient search algorithms
    const binarySearch = (arr: number[], target: number): number => {
      let left = 0;
      let right = arr.length - 1;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
      }
      return -1;
    };

    const sortedArray = Array.from({ length: 10000 }, (_, i) => i * 2);
    const target = 5000;
    
    const result = binarySearch(sortedArray, target);
    expect(result).toBe(2500); // Index of 5000 in the array
    
    // Binary search should be much faster than linear search for large arrays
    const linearSearchTime = performance.now();
    const linearResult = sortedArray.indexOf(target);
    const linearDuration = performance.now() - linearSearchTime;
    
    const binarySearchTime = performance.now();
    const binaryResult = binarySearch(sortedArray, target);
    const binaryDuration = performance.now() - binarySearchTime;
    
    expect(linearResult).toBe(binaryResult);
    // Binary search should typically be faster for large arrays
    expect(binaryDuration).toBeLessThanOrEqual(linearDuration * 2); // Allow some margin
  });

  test('optimizes memory usage with object pooling', () => {
    // Object pool for expensive objects
    class ObjectPool<T> {
      private available: T[] = [];
      private factory: () => T;
      private reset: (obj: T) => void;

      constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 5) {
        this.factory = factory;
        this.reset = reset;
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
          this.available.push(factory());
        }
      }

      acquire(): T {
        if (this.available.length > 0) {
          return this.available.pop()!;
        }
        return this.factory();
      }

      release(obj: T): void {
        this.reset(obj);
        this.available.push(obj);
      }

      size(): number {
        return this.available.length;
      }
    }

    // Test with expensive canvas objects
    const canvasPool = new ObjectPool(
      () => ({
        width: 800,
        height: 600,
        data: new Uint8ClampedArray(800 * 600 * 4),
        dirty: false
      }),
      (canvas) => {
        canvas.data.fill(0);
        canvas.dirty = false;
      },
      3
    );

    expect(canvasPool.size()).toBe(3);
    
    const canvas1 = canvasPool.acquire();
    const canvas2 = canvasPool.acquire();
    expect(canvasPool.size()).toBe(1);
    
    canvasPool.release(canvas1);
    canvasPool.release(canvas2);
    expect(canvasPool.size()).toBe(3);
  });

  test('implements lazy loading and virtual scrolling', () => {
    // Virtual list implementation for large datasets
    class VirtualList<T> {
      private data: T[];
      private itemHeight: number;
      private containerHeight: number;
      private scrollTop: number = 0;

      constructor(data: T[], itemHeight: number, containerHeight: number) {
        this.data = data;
        this.itemHeight = itemHeight;
        this.containerHeight = containerHeight;
      }

      getVisibleItems(): { items: T[]; startIndex: number; endIndex: number } {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(
          startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
          this.data.length - 1
        );

        return {
          items: this.data.slice(startIndex, endIndex + 1),
          startIndex,
          endIndex
        };
      }

      setScrollTop(scrollTop: number): void {
        this.scrollTop = Math.max(0, Math.min(scrollTop, this.getMaxScrollTop()));
      }

      getMaxScrollTop(): number {
        return Math.max(0, this.data.length * this.itemHeight - this.containerHeight);
      }

      getTotalHeight(): number {
        return this.data.length * this.itemHeight;
      }
    }

    const largeDataset = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
    const virtualList = new VirtualList(largeDataset, 50, 500);

    // At top
    const topItems = virtualList.getVisibleItems();
    expect(topItems.items.length).toBeLessThanOrEqual(12); // Should only render visible items
    expect(topItems.startIndex).toBe(0);

    // Scroll to middle
    virtualList.setScrollTop(250000); // Scroll to middle
    const middleItems = virtualList.getVisibleItems();
    expect(middleItems.startIndex).toBeGreaterThan(4000);
    expect(middleItems.items.length).toBeLessThanOrEqual(12);
  });
});

describe('Accessibility (a11y) Tests', () => {
  test('validates ARIA attributes and roles', () => {
    const a11yValidator = {
      validateAriaRole: (role: string): { valid: boolean; suggestions?: string[] } => {
        const validRoles = [
          'button', 'link', 'checkbox', 'radio', 'menuitem', 'tab', 'tabpanel',
          'dialog', 'alertdialog', 'tooltip', 'status', 'alert', 'log',
          'banner', 'main', 'navigation', 'complementary', 'contentinfo'
        ];

        if (validRoles.includes(role)) {
          return { valid: true };
        }

        const suggestions = validRoles.filter(validRole => 
          validRole.toLowerCase().includes(role.toLowerCase()) ||
          role.toLowerCase().includes(validRole.toLowerCase())
        );

        return { valid: false, suggestions };
      },

      validateAriaLabel: (label: string): { valid: boolean; issues: string[] } => {
        const issues: string[] = [];

        if (!label || label.trim() === '') {
          issues.push('ARIA label is empty');
        }

        if (label.length < 3) {
          issues.push('ARIA label is too short');
        }

        if (label.length > 100) {
          issues.push('ARIA label is too long');
        }

        if (/^(click|button|link)$/i.test(label.trim())) {
          issues.push('ARIA label is not descriptive enough');
        }

        return { valid: issues.length === 0, issues };
      },

      checkContrastRatio: (foreground: string, background: string): { ratio: number; passes: { aa: boolean; aaa: boolean } } => {
        // Simplified contrast calculation (in real implementation, would parse colors properly)
        const getLuminance = (color: string): number => {
          // Mock implementation - in real code would parse RGB values
          const mockLuminance: Record<string, number> = {
            '#000000': 0,
            '#ffffff': 1,
            '#808080': 0.5,
            '#ff0000': 0.3,
            '#00ff00': 0.7,
            '#0000ff': 0.1
          };
          return mockLuminance[color.toLowerCase()] || 0.5;
        };

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
          ratio,
          passes: {
            aa: ratio >= 4.5,
            aaa: ratio >= 7
          }
        };
      }
    };

    // Test valid ARIA role
    expect(a11yValidator.validateAriaRole('button')).toEqual({ valid: true });
    
    // Test invalid ARIA role with suggestions
    const invalidRole = a11yValidator.validateAriaRole('clickable');
    expect(invalidRole.valid).toBe(false);
    expect(invalidRole.suggestions).toContain('button');

    // Test ARIA label validation
    expect(a11yValidator.validateAriaLabel('Submit form')).toEqual({ valid: true, issues: [] });
    expect(a11yValidator.validateAriaLabel('Click')).toEqual({ 
      valid: false, 
      issues: ['ARIA label is not descriptive enough', 'ARIA label is too short']
    });

    // Test contrast ratios
    const highContrast = a11yValidator.checkContrastRatio('#000000', '#ffffff');
    expect(highContrast.passes.aa).toBe(true);
    expect(highContrast.passes.aaa).toBe(true);

    const lowContrast = a11yValidator.checkContrastRatio('#808080', '#ffffff');
    expect(lowContrast.passes.aa).toBe(false);
  });

  test('validates keyboard navigation', () => {
    const keyboardNavigator = {
      createTabbableElementsManager: () => {
        const tabbableElements: HTMLElement[] = [];
        let currentIndex = -1;

        return {
          addElement: (element: { tagName: string; tabIndex?: number; disabled?: boolean }) => {
            if (!element.disabled && (element.tabIndex === undefined || element.tabIndex >= 0)) {
              tabbableElements.push(element as HTMLElement);
            }
          },

          handleTabKey: (shiftKey: boolean = false): number => {
            if (tabbableElements.length === 0) return -1;

            if (shiftKey) {
              currentIndex = currentIndex <= 0 ? tabbableElements.length - 1 : currentIndex - 1;
            } else {
              currentIndex = currentIndex >= tabbableElements.length - 1 ? 0 : currentIndex + 1;
            }

            return currentIndex;
          },

          getCurrentElement: () => {
            return currentIndex >= 0 ? tabbableElements[currentIndex] : null;
          },

          getTabbableCount: () => tabbableElements.length
        };
      },

      createFocusTrap: () => {
        let isActive = false;
        const trapStack: any[] = [];

        return {
          activate: (container: { contains: (element: any) => boolean }) => {
            isActive = true;
            trapStack.push(container);
          },

          deactivate: () => {
            trapStack.pop();
            isActive = trapStack.length > 0;
          },

          handleFocusOut: (target: any): boolean => {
            if (!isActive || trapStack.length === 0) return false;
            
            const currentTrap = trapStack[trapStack.length - 1];
            return !currentTrap.contains(target);
          },

          isActive: () => isActive
        };
      }
    };

    const manager = keyboardNavigator.createTabbableElementsManager();
    
    // Add tabbable elements
    manager.addElement({ tagName: 'BUTTON' });
    manager.addElement({ tagName: 'INPUT' });
    manager.addElement({ tagName: 'A' });
    manager.addElement({ tagName: 'BUTTON', disabled: true }); // Should not be added

    expect(manager.getTabbableCount()).toBe(3);

    // Test forward navigation
    expect(manager.handleTabKey(false)).toBe(0); // First element
    expect(manager.handleTabKey(false)).toBe(1); // Second element
    expect(manager.handleTabKey(false)).toBe(2); // Third element
    expect(manager.handleTabKey(false)).toBe(0); // Wrap to first

    // Test backward navigation
    expect(manager.handleTabKey(true)).toBe(2); // Wrap to last
    expect(manager.handleTabKey(true)).toBe(1); // Previous element

    // Test focus trap
    const focusTrap = keyboardNavigator.createFocusTrap();
    expect(focusTrap.isActive()).toBe(false);

    const mockContainer = { contains: (el: any) => el === 'inside' };
    focusTrap.activate(mockContainer);
    expect(focusTrap.isActive()).toBe(true);

    expect(focusTrap.handleFocusOut('inside')).toBe(false); // Should allow focus inside
    expect(focusTrap.handleFocusOut('outside')).toBe(true); // Should prevent focus outside
  });

  test('validates screen reader compatibility', () => {
    const screenReaderHelper = {
      createLiveRegion: (politeness: 'off' | 'polite' | 'assertive' = 'polite') => {
        const announcements: string[] = [];
        
        return {
          announce: (message: string, priority?: 'low' | 'medium' | 'high') => {
            const timestamp = Date.now();
            announcements.push(`[${timestamp}] ${priority || 'medium'}: ${message}`);
          },

          getAnnouncements: () => announcements,

          clear: () => {
            announcements.length = 0;
          },

          getPoliteness: () => politeness
        };
      },

      validateSemanticStructure: (headings: { level: number; text: string }[]) => {
        const issues: string[] = [];
        
        if (headings.length === 0) {
          issues.push('No headings found');
          return { valid: false, issues };
        }

        // Check if first heading is h1
        if (headings[0].level !== 1) {
          issues.push('First heading should be h1');
        }

        // Check for skipped levels
        for (let i = 1; i < headings.length; i++) {
          const currentLevel = headings[i].level;
          const previousLevel = headings[i - 1].level;
          
          if (currentLevel - previousLevel > 1) {
            issues.push(`Heading level skipped: h${previousLevel} to h${currentLevel}`);
          }
        }

        // Check for empty headings
        headings.forEach((heading, index) => {
          if (!heading.text.trim()) {
            issues.push(`Empty heading at position ${index + 1}`);
          }
        });

        return { valid: issues.length === 0, issues };
      },

      generateAltText: (imageContext: { filename?: string; surroundingText?: string; purpose?: string }) => {
        const { filename, surroundingText, purpose } = imageContext;
        
        if (purpose === 'decorative') {
          return { altText: '', role: 'presentation' };
        }

        let altText = '';
        
        if (purpose) {
          altText = purpose;
        } else if (surroundingText) {
          altText = `Image related to: ${surroundingText.substring(0, 50)}`;
        } else if (filename) {
          // Generate from filename
          const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
          altText = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
          altText = 'Image';
        }

        return { altText, role: 'img' };
      }
    };

    // Test live region
    const liveRegion = screenReaderHelper.createLiveRegion('assertive');
    liveRegion.announce('Form submitted successfully', 'high');
    liveRegion.announce('Loading data', 'low');

    const announcements = liveRegion.getAnnouncements();
    expect(announcements).toHaveLength(2);
    expect(announcements[0]).toContain('high: Form submitted successfully');
    expect(liveRegion.getPoliteness()).toBe('assertive');

    // Test heading structure validation
    const goodHeadings = [
      { level: 1, text: 'Main Title' },
      { level: 2, text: 'Section 1' },
      { level: 3, text: 'Subsection' },
      { level: 2, text: 'Section 2' }
    ];

    const badHeadings = [
      { level: 2, text: 'Wrong Start' }, // Should start with h1
      { level: 4, text: 'Skipped Level' }, // Skipped h3
      { level: 3, text: '' } // Empty heading
    ];

    expect(screenReaderHelper.validateSemanticStructure(goodHeadings)).toEqual({
      valid: true,
      issues: []
    });

    const badResult = screenReaderHelper.validateSemanticStructure(badHeadings);
    expect(badResult.valid).toBe(false);
    expect(badResult.issues).toContain('First heading should be h1');
    expect(badResult.issues).toContain('Heading level skipped: h2 to h4');

    // Test alt text generation
    expect(screenReaderHelper.generateAltText({ purpose: 'decorative' })).toEqual({
      altText: '',
      role: 'presentation'
    });

    expect(screenReaderHelper.generateAltText({ 
      filename: 'user-profile-photo.jpg' 
    })).toEqual({
      altText: 'User Profile Photo',
      role: 'img'
    });

    expect(screenReaderHelper.generateAltText({ 
      surroundingText: 'Our company was founded in 1995 and has grown significantly',
      purpose: 'Chart showing company growth over time'
    })).toEqual({
      altText: 'Chart showing company growth over time',
      role: 'img'
    });
  });
});

describe('User Experience (UX) Tests', () => {
  test('measures user interaction response times', () => {
    const uxMetrics = {
      measureInteractionDelay: () => {
        let interactionStart = 0;
        let responseTimes: number[] = [];

        return {
          startInteraction: () => {
            interactionStart = performance.now();
          },

          endInteraction: () => {
            if (interactionStart > 0) {
              const responseTime = performance.now() - interactionStart;
              responseTimes.push(responseTime);
              interactionStart = 0;
              return responseTime;
            }
            return 0;
          },

          getAverageResponseTime: () => {
            if (responseTimes.length === 0) return 0;
            return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
          },

          getPercentile: (percentile: number) => {
            if (responseTimes.length === 0) return 0;
            const sorted = [...responseTimes].sort((a, b) => a - b);
            const index = Math.ceil((percentile / 100) * sorted.length) - 1;
            return sorted[index];
          },

          reset: () => {
            responseTimes = [];
          }
        };
      },

      validateLoadingStates: (loadingTime: number) => {
        const thresholds = {
          instant: 100,    // 100ms - feels instant
          fast: 300,       // 300ms - fast enough for most interactions
          acceptable: 1000, // 1s - acceptable for complex operations
          slow: 3000       // 3s - user starts to lose focus
        };

        if (loadingTime <= thresholds.instant) {
          return { rating: 'excellent', feedback: 'Feels instant' };
        } else if (loadingTime <= thresholds.fast) {
          return { rating: 'good', feedback: 'Fast response' };
        } else if (loadingTime <= thresholds.acceptable) {
          return { rating: 'acceptable', feedback: 'Acceptable response time' };
        } else if (loadingTime <= thresholds.slow) {
          return { rating: 'poor', feedback: 'Consider adding loading indicator' };
        } else {
          return { rating: 'unacceptable', feedback: 'Too slow, needs optimization' };
        }
      }
    };

    const interactionTracker = uxMetrics.measureInteractionDelay();
    
    // Simulate user interactions
    interactionTracker.startInteraction();
    // Simulate some processing time
    const responseTime = interactionTracker.endInteraction();
    expect(responseTime).toBeGreaterThan(0);

    // Test multiple interactions
    for (let i = 0; i < 5; i++) {
      interactionTracker.startInteraction();
      interactionTracker.endInteraction();
    }

    expect(interactionTracker.getAverageResponseTime()).toBeGreaterThan(0);
    expect(interactionTracker.getPercentile(95)).toBeGreaterThan(0);

    // Test loading time validation
    expect(uxMetrics.validateLoadingStates(50)).toEqual({
      rating: 'excellent',
      feedback: 'Feels instant'
    });

    expect(uxMetrics.validateLoadingStates(2000)).toEqual({
      rating: 'poor',
      feedback: 'Consider adding loading indicator'
    });
  });

  test('validates responsive design breakpoints', () => {
    const responsiveValidator = {
      getBreakpoints: () => ({
        mobile: { min: 0, max: 767 },
        tablet: { min: 768, max: 1023 },
        desktop: { min: 1024, max: 1439 },
        wide: { min: 1440, max: Infinity }
      }),

      validateLayout: (width: number, elements: { minWidth?: number; maxWidth?: number; flexible: boolean }[]) => {
        const breakpoints = responsiveValidator.getBreakpoints();
        const currentBreakpoint = Object.entries(breakpoints).find(
          ([, range]) => width >= range.min && width <= range.max
        )?.[0] || 'unknown';

        const issues: string[] = [];

        elements.forEach((element, index) => {
          if (element.minWidth && width < element.minWidth) {
            issues.push(`Element ${index} too narrow for current viewport`);
          }

          if (element.maxWidth && width > element.maxWidth) {
            issues.push(`Element ${index} too wide for current viewport`);
          }

          if (!element.flexible && currentBreakpoint === 'mobile') {
            issues.push(`Element ${index} should be flexible on mobile`);
          }
        });

        return {
          breakpoint: currentBreakpoint,
          valid: issues.length === 0,
          issues
        };
      },

      testTouchTargets: (targets: { width: number; height: number; spacing: number }[]) => {
        const minTouchTarget = 44; // iOS/Android recommendation
        const minSpacing = 8;
        const issues: string[] = [];

        targets.forEach((target, index) => {
          if (target.width < minTouchTarget || target.height < minTouchTarget) {
            issues.push(`Touch target ${index} is too small (${target.width}x${target.height}px)`);
          }

          if (target.spacing < minSpacing) {
            issues.push(`Touch target ${index} has insufficient spacing (${target.spacing}px)`);
          }
        });

        return {
          valid: issues.length === 0,
          issues
        };
      }
    };

    // Test mobile layout
    const mobileValidation = responsiveValidator.validateLayout(375, [
      { minWidth: 300, flexible: true },
      { maxWidth: 400, flexible: true },
      { minWidth: 500, flexible: false } // This should cause an issue
    ]);

    expect(mobileValidation.breakpoint).toBe('mobile');
    expect(mobileValidation.valid).toBe(false);
    expect(mobileValidation.issues).toContain('Element 2 too narrow for current viewport');

    // Test desktop layout
    const desktopValidation = responsiveValidator.validateLayout(1200, [
      { minWidth: 300, flexible: false },
      { maxWidth: 1500, flexible: false }
    ]);

    expect(desktopValidation.breakpoint).toBe('desktop');
    expect(desktopValidation.valid).toBe(true);

    // Test touch targets
    const touchTargetValidation = responsiveValidator.testTouchTargets([
      { width: 44, height: 44, spacing: 8 }, // Good
      { width: 30, height: 30, spacing: 4 }, // Too small and poor spacing
      { width: 48, height: 48, spacing: 12 }  // Good
    ]);

    expect(touchTargetValidation.valid).toBe(false);
    expect(touchTargetValidation.issues).toContain('Touch target 1 is too small (30x30px)');
    expect(touchTargetValidation.issues).toContain('Touch target 1 has insufficient spacing (4px)');
  });
});
