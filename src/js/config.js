tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                'app-background': '#F0F8FF',
                'app-primary': '#A0D2EB',
                'app-accent': '#FFB347',
            },
            keyframes: {
                spin: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                fadeIn: {
                    '0%': { opacity: 0, transform: 'translateY(-10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeOut: {
                    '0%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(-10px)' },
                }
            },
            animation: {
                spin: 'spin 1s linear infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-out': 'fadeOut 0.3s ease-in',
            },
        }
    },
    plugins: [
        function({ addUtilities }) {
            addUtilities({
                '.line-clamp-2': {
                    'overflow': 'hidden',
                    'display': '-webkit-box',
                    '-webkit-box-orient': 'vertical',
                    '-webkit-line-clamp': '2',
                },
            }, ['responsive'])
        }
    ]
}
