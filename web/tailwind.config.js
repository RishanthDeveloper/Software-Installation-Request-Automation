/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--ink)",
        card: "var(--surface)",
        "card-foreground": "var(--ink)",
        primary: "var(--brand)",
        "primary-foreground": "var(--surface)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted)",
        border: "var(--line)",
        success: "var(--cleared)",
        warning: "var(--held)",
        destructive: "var(--denied)",
        
        // Semantic aliases
        brand: "var(--brand)",
        ink: "var(--ink)",
        surface: "var(--surface)",
        line: "var(--line)",
        cleared: "var(--cleared)",
        held: "var(--held)",
        denied: "var(--denied)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        full: '9999px',
      },
      boxShadow: {
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
      },
    },
  },
  plugins: [],
}
