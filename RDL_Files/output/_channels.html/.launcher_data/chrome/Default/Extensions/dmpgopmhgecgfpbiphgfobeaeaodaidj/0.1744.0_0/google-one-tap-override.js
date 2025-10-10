// This script is injected into the page to override the google one tap library
// and detect the automatic login when the user clicks on the one tap button.
// In chrome, the google.accounts.id.initialize function receives a callback that is called when the user logs in.
// We override both this function and the internal callback, which gets called with a JWT the contains the users's email
// Then, we dispatch a custom event that will be handled by the main content script,
// which will evaluate it as a login record, and will prevent the event if it needs to be blocked
// If the event is prevented, the original callback is not called, and the user is not logged in

;(() => {
    const googleOneTapClientScriptUrl = 'https://accounts.google.com/gsi/client'

    /**
     * @type {MutationObserver[]}
     */
    const registeredObservers = []

    const override = () => {
        if (!window.google?.accounts?.id?.initialize) {
            return false
        }

        const originalInitialize = window.google.accounts.id.initialize
        window.google.accounts.id.initialize = function (config) {
            const origConfigCallback = config.callback
            const newCallback = (args) => {
                // Create a synthetic event that will be handled by the main content script
                const oneTapLoginEvent = new CustomEvent('oneTapLogin', {
                    detail: { args },
                    cancelable: true,
                })
                document.dispatchEvent(oneTapLoginEvent)

                if (!oneTapLoginEvent.defaultPrevented) {
                    // If the event was not prevented, call the original callback
                    return origConfigCallback(args)
                }
            }
            config.callback = newCallback

            // Call the original function
            return originalInitialize(config)
        }

        registeredObservers.forEach((observer) => observer.disconnect())
        return true
    }

    /**
     * @param {HTMLScriptElement} node
     */
    const tryOverride = (node) => {
        // try to override immediately, if it fails, wait for the script to load
        if (override()) return

        node.addEventListener(
            'load',
            () => {
                override()
            },
            { once: true, capture: true }
        )
    }

    /**
     * @param {number} stopAfter - The time in milliseconds after which the observer should stop observing
     */
    const createObserver = (stopAfter) => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes) {
                    for (const node of mutation.addedNodes) {
                        // Check if a script tag has been added
                        if (node.tagName === 'SCRIPT' && node.src === googleOneTapClientScriptUrl) {
                            tryOverride(node)
                        }
                    }
                }
            }
        })

        registeredObservers.push(observer)
        setTimeout(() => {
            observer.disconnect()
        }, stopAfter)
        return observer
    }

    const overrideGoogleOneTap = () => {
        // If the script already exists, override it immediately
        const oneTapScriptElements = document.querySelectorAll(`script[src="${googleOneTapClientScriptUrl}"]`)
        if (oneTapScriptElements.length > 0) {
            tryOverride(oneTapScriptElements[0])

            return
        }

        const observeElement = (elementName) => {
            if (document[elementName]) {
                const observer = createObserver(5_000)
                observer.observe(document[elementName], { childList: true })
                return
            }

            /**
             * Wait for the element to be added to the DOM
             */
            const elementObserver = new MutationObserver(() => {
                if (document[elementName]) {
                    elementObserver.disconnect()

                    // Detected
                    const observer = createObserver(5_000)
                    observer.observe(document[elementName], { childList: true })
                }
            })
            elementObserver.observe(document.documentElement, { childList: true })
        }

        observeElement('head')
        observeElement('body')
    }

    try {
        overrideGoogleOneTap()
    } catch (error) {
        console.error(error)
    }
})()
