const colors = require('tailwindcss/colors');

module.exports = {
    content: [
        './projects/**/*.html',
        './projects/**/*.ts',
        './projects/**/*.css'
    ],
    safelist: [],
    theme: {
        extend: {
            // colors: {
            //     orange: colors.orange
            // },
            spacing: {
                "safe-top": "env(safe-area-inset-top)",
                "safe-top-1": "calc(env(safe-area-inset-top) + 2.5rem)",
                "safe-top-2": "calc(env(safe-area-inset-top) + 3rem)",
                "safe-bottom": "env(safe-area-inset-bottom)",
            },
            screens: {
                standalone: {
                    raw: "(display-mode: standalone)"
                }
            }
        },
    },
    corePlugins: {
        container: false,
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        ({
            addComponents,
            theme
        }) => {
            const container = {
                // https://dev.to/bourhaouta/tailwind-container-the-right-way-5g77
                ".container": {
                    "@apply mx-auto": {},
                    maxWidth: theme("screens.sm"),
                },
            };
            addComponents(container);
        },
        ({
            addVariant,
            e,
            postcss
        }) => {
            addVariant("checked-sibling", ({
                container,
                separator
            }) => {
                container.walkRules((rule) => {
                    rule.selector = `:checked + .checked-sibling\\:${rule.selector.slice(1)}`;
                    // rule.selector = `.${e(`:checked + .checked-sibling${separator}${rule.selector.slice(1)}`)}`
                });
            });
        }
    ],
};
