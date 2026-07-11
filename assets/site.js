/* Shared site behaviour: Tailwind config, dark/light theme toggle, mobile nav.
   The no-flash <head> snippet sets the initial `dark` class before paint;
   this file wires up Tailwind and the interactive controls. */

// Tailwind Play CDN configuration (must run after the CDN <script> tag).
if (window.tailwind) {
    window.tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                },
            },
        },
    };
}

(function () {
    const STORAGE_KEY = 'vz-theme';
    const root = document.documentElement;

    function currentTheme() {
        return root.classList.contains('dark') ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        updateToggleIcons(theme);
    }

    // Swap the moon/sun icon on every toggle button to reflect state.
    function updateToggleIcons(theme) {
        document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
            const icon = btn.querySelector('i');
            if (!icon) return;
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                btn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                icon.className = 'fas fa-moon';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        });
    }

    function wireUp() {
        // Reflect the theme the no-flash snippet already applied.
        updateToggleIcons(currentTheme());

        document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = currentTheme() === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                try {
                    localStorage.setItem(STORAGE_KEY, next);
                } catch (e) {
                    /* storage may be unavailable; toggle still works for the session */
                }
            });
        });

        // Mobile navigation drawer.
        const menuBtn = document.querySelector('[data-menu-toggle]');
        const mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuBtn && mobileNav) {
            menuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('hidden');
            });
            mobileNav.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => mobileNav.classList.add('hidden'));
            });
        }

        // The monogram fallback shows by default; reveal the real photo only
        // once it has actually loaded, so a missing profile.jpg never flashes
        // a broken-image icon.
        document.querySelectorAll('[data-avatar-img]').forEach((img) => {
            const fallback = img.parentElement.querySelector('[data-avatar-fallback]');
            const showPhoto = () => {
                img.classList.remove('hidden');
                if (fallback) fallback.classList.add('hidden');
            };
            if (img.complete && img.naturalWidth > 0) {
                showPhoto();
            }
            img.addEventListener('load', () => {
                if (img.naturalWidth > 0) showPhoto();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireUp);
    } else {
        wireUp();
    }
})();
