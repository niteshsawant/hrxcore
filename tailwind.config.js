/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                background: 'var(--background)',
                surface: 'var(--surface)',
                success: 'var(--success)',
                error: 'var(--error)',
                text: 'var(--text)',
                'text-secondary': 'var(--text-secondary)',
            },
        },
    },
    plugins: [],
}
