import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bindBasicWebVitals, bindCopyTracking, bindErrorTracking, bindGlobalClickTracking, bindScrollDepthTracking, captureAndStoreUtmParams, initAnalytics, trackPageView, updateUserProperties } from '../lib/analytics';
import { useTheme } from '../design-system/context/ThemeContext';
import { useTranslation } from '../context/TranslationContext';

// Bridges analytics lifecycle into the app; must be mounted inside Router
export default function AnalyticsBridge() {
  const location = useLocation();
  const { theme, colorScheme, isDarkMode } = useTheme();
  const { language } = useTranslation();

  useEffect(() => {
    initAnalytics();
    captureAndStoreUtmParams();
    bindGlobalClickTracking();
    bindErrorTracking();
    bindCopyTracking();
    bindBasicWebVitals();
  }, []);

  // Track route changes (SPA page_view)
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
    bindScrollDepthTracking(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Sync user properties (theme, language, color scheme)
  useEffect(() => {
    updateUserProperties({
      theme_mode: theme,
      is_dark_mode: isDarkMode,
      color_scheme: colorScheme,
      language,
    });
  }, [theme, isDarkMode, colorScheme, language]);

  return null;
}