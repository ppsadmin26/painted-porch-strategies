import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand colors
        strategic: {
          DEFAULT: "hsl(var(--strategic))",
          foreground: "hsl(var(--strategic-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          foreground: "hsl(var(--navy-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        lime: {
          DEFAULT: "hsl(var(--lime))",
          foreground: "hsl(var(--lime-foreground))",
        },
        raspberry: {
          DEFAULT: "hsl(var(--raspberry))",
          foreground: "hsl(var(--raspberry-foreground))",
        },
        bluedoor: {
          DEFAULT: "hsl(var(--bluedoor))",
          foreground: "hsl(var(--bluedoor-foreground))",
        },
        charcoal: "hsl(0, 0%, 33%)",
        teal: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Legacy `pps-*` aliases used by program/landing pages
        "pps-navy": "hsl(var(--navy))",
        "pps-gold": "hsl(var(--gold))",
        "pps-lime": "hsl(var(--lime))",
        "pps-raspberry": "hsl(var(--raspberry))",
        "pps-teal": "hsl(var(--primary))",
        "pps-orange": "hsl(var(--gold))",
        "pps-purple": "hsl(var(--strategic))",
        "pps-bluedoor": "hsl(var(--bluedoor))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "kenburns": {
          "0%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(1.08)",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "blob-1": {
          "0%": { transform: "translate(10%, 20%) scale(1)", opacity: "0.7" },
          "25%": { transform: "translate(60%, 10%) scale(1.2)", opacity: "0.5" },
          "50%": { transform: "translate(40%, 60%) scale(0.9)", opacity: "0.7" },
          "75%": { transform: "translate(5%, 50%) scale(1.1)", opacity: "0.6" },
          "100%": { transform: "translate(10%, 20%) scale(1)", opacity: "0.7" },
        },
        "blob-2": {
          "0%": { transform: "translate(60%, 50%) scale(1)", opacity: "0.6" },
          "25%": { transform: "translate(20%, 70%) scale(1.15)", opacity: "0.7" },
          "50%": { transform: "translate(10%, 20%) scale(0.95)", opacity: "0.5" },
          "75%": { transform: "translate(50%, 30%) scale(1.1)", opacity: "0.65" },
          "100%": { transform: "translate(60%, 50%) scale(1)", opacity: "0.6" },
        },
        "blob-3": {
          "0%": { transform: "translate(30%, 60%) scale(1)", opacity: "0.6" },
          "25%": { transform: "translate(50%, 20%) scale(1.1)", opacity: "0.5" },
          "50%": { transform: "translate(70%, 50%) scale(1.2)", opacity: "0.7" },
          "75%": { transform: "translate(20%, 40%) scale(0.9)", opacity: "0.55" },
          "100%": { transform: "translate(30%, 60%) scale(1)", opacity: "0.6" },
        },
        "blob-4": {
          "0%": { transform: "translate(50%, 10%) scale(1)", opacity: "0.5" },
          "25%": { transform: "translate(10%, 40%) scale(1.2)", opacity: "0.6" },
          "50%": { transform: "translate(30%, 70%) scale(0.85)", opacity: "0.4" },
          "75%": { transform: "translate(70%, 30%) scale(1.15)", opacity: "0.55" },
          "100%": { transform: "translate(50%, 10%) scale(1)", opacity: "0.5" },
        },
        "blob-5": {
          "0%": { transform: "translate(70%, 70%) scale(1)", opacity: "0.5" },
          "25%": { transform: "translate(30%, 30%) scale(1.1)", opacity: "0.6" },
          "50%": { transform: "translate(50%, 10%) scale(1.2)", opacity: "0.45" },
          "75%": { transform: "translate(60%, 60%) scale(0.9)", opacity: "0.55" },
          "100%": { transform: "translate(70%, 70%) scale(1)", opacity: "0.5" },
        },
        "pulse-center": {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(0.8)", opacity: "0.2" },
          "50%": { transform: "translate(-50%, -50%) scale(1.3)", opacity: "0.45" },
        },
        "color-shift-base": {
          "0%": { background: "linear-gradient(135deg, hsl(210 100% 21%) 0%, hsl(190 100% 30%) 50%, hsl(210 100% 21%) 100%)" },
          "50%": { background: "linear-gradient(315deg, hsl(210 100% 15%) 0%, hsl(270 40% 30%) 50%, hsl(210 100% 21%) 100%)" },
          "100%": { background: "linear-gradient(135deg, hsl(210 100% 21%) 0%, hsl(190 100% 30%) 50%, hsl(210 100% 21%) 100%)" },
        },
        "slow-float": {
          "0%, 100%": { transform: "scale(1.1) translate(0, 0)" },
          "25%": { transform: "scale(1.15) translate(-2%, -3%)" },
          "50%": { transform: "scale(1.2) translate(1%, -5%)" },
          "75%": { transform: "scale(1.15) translate(3%, -2%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "kenburns": "kenburns 20s ease-in-out infinite alternate",
        marquee: "marquee 60s linear infinite",
        "blob-1": "blob-1 12s ease-in-out infinite",
        "blob-2": "blob-2 15s ease-in-out infinite",
        "blob-3": "blob-3 18s ease-in-out infinite",
        "blob-4": "blob-4 14s ease-in-out infinite",
        "blob-5": "blob-5 16s ease-in-out infinite",
        "pulse-center": "pulse-center 6s ease-in-out infinite",
        "color-shift-base": "color-shift-base 20s ease-in-out infinite",
        "slow-float": "slow-float 25s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
