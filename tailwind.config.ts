import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF5F7",
          100: "#FCE7EC",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#E11D48",
          600: "#BE185D",
          700: "#9D174D",
          800: "#831843",
          900: "#500724",
          950: "#310314",
        },
        blush: {
          light: "#FFF9FA",
          DEFAULT: "#FDF2F4",
          dark: "#F9E4E8",
        },
        gold: {
          light: "#FDFBF7",
          100: "#F5EBE1",
          300: "#E5C378",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#A8843B",
          dark: "#8C6B26",
        },
        charcoal: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#0B0F17",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Cormorant Garamond", "Georgia", "Cambria", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(190, 24, 93, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'luxury': '0 10px 30px -5px rgba(190, 24, 93, 0.08), 0 4px 12px -2px rgba(212, 175, 55, 0.08)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
