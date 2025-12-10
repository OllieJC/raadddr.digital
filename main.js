document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const textToggle = document.getElementById('text-mode-toggle');
    const visualView = document.getElementById('visual-view');
    const textView = document.getElementById('text-view');
    const brandHome = document.getElementById('brand-home');
    const frameworkButton = document.getElementById('framework-button');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const htmlElement = document.documentElement;
    const themeStorageKey = 'color-theme';
    const initialTheme = window.__initialTheme === 'dark' ? 'dark' : 'light';
    const iconMoon = themeToggle?.querySelector('.theme-icon-dark');
    const iconSun = themeToggle?.querySelector('.theme-icon-light');

    const applyThemeState = (theme) => {
        const isDark = theme === 'dark';
        htmlElement.classList.toggle('dark', isDark);
        htmlElement.dataset.theme = theme;
        htmlElement.setAttribute('data-bs-theme', theme);
        themeToggle?.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        if (iconMoon && iconSun) {
            iconMoon.classList.toggle('d-none', isDark === false);
            iconSun.classList.toggle('d-none', isDark === true);
        }
    };

    applyThemeState(initialTheme);

    themeToggle?.addEventListener('click', () => {
        const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem(themeStorageKey, newTheme);
        applyThemeState(newTheme);
    });

    const setTextMode = (isTextMode) => {
        visualView?.classList.toggle('d-none', isTextMode);
        textView?.classList.toggle('d-none', !isTextMode);
        document.body.classList.toggle('text-mode-active', isTextMode);

        if (textToggle) {
            textToggle.classList.toggle('btn-dark', isTextMode);
            textToggle.classList.toggle('btn-outline-secondary', !isTextMode);
            textToggle.classList.toggle('text-white', isTextMode);
            textToggle.setAttribute('aria-pressed', isTextMode ? 'true' : 'false');
        }
    };

    setTextMode(false);

    textToggle?.addEventListener('click', () => {
        const nextState = !document.body.classList.contains('text-mode-active');
        setTextMode(nextState);
    });

    brandHome?.addEventListener('click', () => window.location.reload());

    frameworkButton?.addEventListener('click', () => {
        const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
        document.getElementById('framework-grid')?.scrollIntoView({ behavior });
    });
});
