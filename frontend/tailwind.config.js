/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                slate: {
                    850: '#1e293b', // Custom card bg
                    900: '#0f172a', // Custom page bg
                    950: '#020617', // Darker accerts
                },
                brand: {
                    primary: '#3b82f6', // Blue 500
                    secondary: '#6366f1', // Indigo 500
                    accent: '#8b5cf6', // Violet 500
                    success: '#10b981', // Emerald 500
                    warning: '#f59e0b', // Amber 500
                    danger: '#ef4444', // Red 500
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            slideUp: {
                '0%': { transform: 'translateY(20px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
            },
            scaleIn: {
                '0%': { transform: 'scale(0)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            }
        },
        animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'scale-in': 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy effect
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
    },
},
plugins: [],
}
