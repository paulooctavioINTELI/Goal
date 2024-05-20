module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Certifique-se de que o caminho está correto
  ],
  theme: {
    extend: {
      colors: {
        alice: {
          50: "#fdfefe",
          100: "#fcfdfd",
          200: "#f8fbfb",
          DEFAULT: "#e8f1f2",
          400: "#d1d9da",
          500: "#bac1c2",
          600: "#aeb5b6",
          700: "#8b9191",
          800: "#686c6d",
          900: "#515455",
        },

        red: {
          50: "#f7e7ea",
          100: "#f3dbe0",
          200: "#e7b5be",
          DEFAULT: "#b10f2e",
          400: "#9f0e29",
          500: "#8e0c25",
          600: "#850b23",
          700: "#6a091c",
          800: "#500715",
          900: "#3e0510",
        },

        yellow: {
          50: "#fef7ea",
          100: "#fef3e0",
          200: "#fce6be",
          DEFAULT: "#f6ae2d",
          400: "#dd9d29",
          500: "#c58b24",
          600: "#b98322",
          700: "#94681b",
          800: "#6f4e14",
          900: "#563d10",
        },

        celadon: {
          50: "#f7fdf7",
          100: "#f4fdf3",
          200: "#e7fae7",
          DEFAULT: "#b3efb2",
          400: "#a1d7a0",
          500: "#8fbf8e",
          600: "#86b386",
          700: "#6b8f6b",
          800: "#516c50",
          900: "#3f543e",
        },

        rich: {
          50: "#e6e8e9",
          100: "#d9ddde",
          200: "#b0b8bb",
          DEFAULT: "#001a23",
          400: "#001720",
          500: "#00151c",
          600: "#00141a",
          700: "#001015",
          800: "#000c10",
          900: "#00090c",
        },
      },
    },
  },
  variants: {},
  plugins: [],
};
