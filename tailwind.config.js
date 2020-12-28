const colors = require('tailwindcss/colors');

module.exports = {
    purge: [
        './projects/**/*.html',
        './projects/**/*.ts',
        './projects/**/*.css'
    ],
    darkMode: false, // or 'media' or 'class'
    corePlugins: {
        container: false,
    },
    theme: {
        extend: {
            colors: {
                orange: colors.orange
            },
            spacing: {
                "safe-top": "env(safe-area-inset-top)",
                "safe-top-1": "calc(env(safe-area-inset-top) + 2.5rem)",
                "safe-top-2": "calc(env(safe-area-inset-top) + 3rem)"
            },
            screens: {
                standalone: {raw: "(display-mode: standalone)"}
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        ({
            addComponents,
            theme
        }) => {
            addComponents({
                // https://dev.to/bourhaouta/tailwind-container-the-right-way-5g77
                ".container": {
                    "@apply mx-auto": {},
                    maxWidth: theme("screens.sm"),
                },
            });
        },
    ],
};
