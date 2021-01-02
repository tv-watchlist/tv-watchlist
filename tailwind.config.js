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
                standalone: {
                    raw: "(display-mode: standalone)"
                }
            }
        },
    },
    variants: {
        extend: {
            backgroundColor: ["checked-sibling"],
        },
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
