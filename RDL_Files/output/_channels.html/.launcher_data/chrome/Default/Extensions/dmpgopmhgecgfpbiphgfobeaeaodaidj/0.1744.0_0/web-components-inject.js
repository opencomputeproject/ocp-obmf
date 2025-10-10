const WEB_COMPONENTS_CONFIG = [
    {
        tag: 'link',
        properties: {
            href: chrome.runtime.getURL('fonts/fonts.css'),
            rel: 'stylesheet',
        },
    },
    {
        tag: 'link',
        properties: {
            href: chrome.runtime.getURL('branding/styles.css'),
            rel: 'stylesheet',
        },
    },
    {
        tag: 'script',
        properties: {
            src: chrome.runtime.getURL('web-components/lit-components.js'),
            type: 'module',
        },
    },
]

if (window.top === window.self) {
    WEB_COMPONENTS_CONFIG.forEach(({ tag, properties }) => {
        const injectionTag = document.createElement(tag)
        Object.entries(properties).forEach(([key, value]) => {
            injectionTag[key] = value
        })
        document.head.appendChild(injectionTag)
    })
}
