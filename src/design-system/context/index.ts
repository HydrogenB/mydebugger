// Re-export theme context
export { 
  ThemeContext,
  ThemeProvider, 
  useTheme 
} from '../../app/providers/ThemeProvider';

// Placeholder for Toast context (will be implemented later)
export const ToastProvider = ({ children }: { children: React.ReactNode }) => children;
export const useToast = () => ({
  showToast: () => {},
  hideToast: () => {},
  toasts: []
});
