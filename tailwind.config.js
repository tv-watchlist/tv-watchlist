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
                iT: "env(safe-area-inset-top)",
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
