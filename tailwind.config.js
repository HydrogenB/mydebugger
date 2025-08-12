/**
 * © 2025 MyDebugger Contributors – MIT License
 */
/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', "class"], // Enable dark mode with class strategy
  theme: {
        fontFamily: {
                sans: ['Inter','Noto Sans Thai','system-ui','-apple-system','Segoe UI','Roboto','Helvetica Neue','Arial'],
                mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','Consolas','monospace'],
        },
        extend: {
                colors: {
  			primary: {
  				'50': '#eef2ff',
  				'100': '#e0e7ff',
  				'200': '#c7d2fe',
  				'300': '#a5b4fc',
  				'400': '#818cf8',
  				'500': '#6366f1',
  				'600': '#4f46e5',
  				'700': '#4338ca',
  				'800': '#3730a3',
  				'900': '#312e81',
  				'950': '#1e1b4b',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			surface: {
  				'50': '#f9fafb',
  				'100': '#f3f4f6',
  				'200': '#e5e7eb',
  				'300': '#d1d5db',
  				'400': '#9ca3af',
  				'500': '#6b7280',
  				'600': '#4b5563',
  				'700': '#374151',
  				'800': '#1f2937',
  				'900': '#111827',
  				'950': '#030712'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        bg: '#0B1220',
                        bgMuted: '#0E1626',
                        surface1: '#111A2B',
                        surface2: '#152035',
                        surface3: '#1B2946',
                        text: '#E6EDF7',
                        textMuted: '#A8B3C7',
                        textSubtle: '#7B8AA5',
                        divider: '#1E2A44'
                },
                fontSize: {
                        h1: ['32px', { lineHeight: '38px', letterSpacing: '-0.5px', fontWeight: '700' }],
                        h2: ['24px', { lineHeight: '30px', letterSpacing: '-0.25px', fontWeight: '700' }],
                        h3: ['20px', { lineHeight: '26px', fontWeight: '600' }],
                        body: ['14px', { lineHeight: '20px' }],
                        caption: ['12px', { lineHeight: '18px' }],
                        badge: ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '600' }],
                },
                spacing: {
  			'18': '4.5rem',
  			'72': '18rem',
  			'84': '21rem',
  			'96': '24rem'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'fade-out': 'fadeOut 0.3s ease-in-out',
  			'slide-in-right': 'slideInRight 0.3s ease-in-out',
  			'slide-in-left': 'slideInLeft 0.3s ease-in-out',
  			'slide-in-up': 'slideInUp 0.3s ease-in-out',
  			'slide-in-down': 'slideInDown 0.3s ease-in-out',
  			'bounce-in': 'bounceIn 0.5s ease-in-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'scale-out': 'scaleOut 0.3s ease-in',
  			'tooltip-fade-down': 'tooltipFadeDown 0.2s ease-out forwards',
  			'tooltip-fade-up': 'tooltipFadeUp 0.2s ease-out forwards',
  			'tooltip-fade-left': 'tooltipFadeLeft 0.2s ease-out forwards',
  			'tooltip-fade-right': 'tooltipFadeRight 0.2s ease-out forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					transform: 'translateX(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			slideInLeft: {
  				'0%': {
  					transform: 'translateX(-100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			slideInUp: {
  				'0%': {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			slideInDown: {
  				'0%': {
  					transform: 'translateY(-100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			bounceIn: {
  				'0%': {
  					transform: 'scale(0.8)',
  					opacity: '0'
  				},
  				'70%': {
  					transform: 'scale(1.05)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					transform: 'scale(0.9)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			scaleOut: {
  				'0%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(0.9)',
  					opacity: '0'
  				}
  			},
  			tooltipFadeDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			tooltipFadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			tooltipFadeLeft: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			tooltipFadeRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		transitionDuration: {
  			'50': '50ms',
  			'250': '250ms',
  			'350': '350ms',
  			'450': '450ms',
  			'600': '600ms'
  		},
  		transitionTimingFunction: {
  			emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  			'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  			'emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  			spring: 'cubic-bezier(0.5, 0, 0.1, 1.2)',
  			bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: '100%'
  				}
  			}
  		},
  		borderRadius: {
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
                boxShadow: {
                        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                        soft: '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
                        card: '0 1px 2px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.03)',
                        'card-lg': '0 8px 24px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04)',
                        interactive: '0 2px 10px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.1)',
                        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }
  	}
  },
  plugins: [
    forms,
    typography,
    function({ addUtilities }) {
      const newUtilities = {
        // Add reduced motion utilities
        '.motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'animation-duration': '0.001ms !important',
            'transition-duration': '0.001ms !important',
            'animation-iteration-count': '1 !important',
          }
        },
        // Custom animation utilities for components
        '.animate-fade-in-dialog': {
          animation: 'scaleIn 0.3s ease-out forwards'
        },
        '.animate-fade-out-dialog': {
          animation: 'scaleOut 0.2s ease-in forwards'
        },
      }
      addUtilities(newUtilities)
    },
    animate
  ],
}
