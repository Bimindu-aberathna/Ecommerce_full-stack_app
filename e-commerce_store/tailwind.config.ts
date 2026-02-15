import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        // Secondary colors
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
        },
        // Accent colors
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
        },
        // Semantic colors
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
        },
        error: {
          DEFAULT: "var(--error)",
          light: "var(--error-light)",
        },
        info: {
          DEFAULT: "var(--info)",
          light: "var(--info-light)",
        },
        // Text colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          white: "var(--text-white)",
        },
        // Background colors
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        // Border colors
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
          dark: "var(--border-dark)",
        },
        // Component specific
        input: {
          bg: "var(--input-bg)",
          border: "var(--input-border)",
          focus: "var(--input-focus)",
          placeholder: "var(--input-placeholder)",
        },
        button: {
          primary: {
            // bg: "var(--button-primary-bg)",
            // hover: "var(--button-primary-hover)",
            text: "var(--button-primary-text)",
          },
        },
        card: {
          bg: "var(--card-bg)",
          border: "var(--card-border)",
        },
        header: {
          bg: "var(--header-bg)",
        },
        footer: {
          bg: "var(--footer-bg)",
        },
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
      },
      boxShadow: {
        card: "var(--card-shadow)",
      },
      animation : {
        typewriter: "typewriter 12s infinite"
      },
      keyframes: {
        typewriter: {
          "0%": { content: "''" },
          "5%": { content: "'H'" },
          "10%": { content: "'He'" },
          "15%": { content: "'Hel'" },
          "20%": { content: "'Hell'" },
          "25%": { content: "'Hello'" },
          "30%": { content: "'Hello!'" },
          "40%": { content: "'Hello!'" },
          "45%": { content: "'Hello'" },
          "50%": { content: "'Hell'" },
          "55%": { content: "'Hel'" },
          "60%": { content: "'He'" },
          "65%": { content: "'H'" },
          "70%": { content: "''" },
          "75%": { content: "'H'" },
          "80%": { content: "'Ho'" },
          "85%": { content: "'Hol'" },
          "90%": { content: "'Hola'" },
          "95%": { content: "'Hola!'" },
          "100%": { content: "'Hola!'" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
