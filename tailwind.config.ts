import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#12151c",
        panel2: "#181c25",
        border: "#262d3b",
        text: "#e6e9ef",
        dim: "#9aa3b2",
        mute: "#6b7384",
        accent: "#7c9cff",
        accent2: "#5eead4",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
