import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.15), 0 20px 60px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [typography],
};

