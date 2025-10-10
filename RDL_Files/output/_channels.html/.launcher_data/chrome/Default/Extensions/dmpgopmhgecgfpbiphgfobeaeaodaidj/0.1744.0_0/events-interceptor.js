/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-this-alias */
;(() => {
    const abortController = new AbortController()

    /** @returns {null | import('type-fest').PartialDeep<typeof chrome>} */
    const getBrowser = () => {
        if (typeof chrome !== 'undefined') {
            return chrome
        }

        // @ts-ignore
        if (typeof browser !== 'undefined') {
            // @ts-ignore
            return browser
        }

        return null
    }
    const getExtensionId = () => getBrowser()?.runtime?.id

    /** @type {(keyof WindowEventMap)[]} */
    const eventsToIntercept = [
        'blur',
        'focus',
        'change',
        'drop',
        'copy',
        'cut',
        'paste',
        'input',
        'keydown',
        'click',
        'beforeprint',
        'afterprint',
        // Dont add submit as it currently relys on being added on form element and not window.
    ]

    eventsToIntercept.forEach((eventType) => {
        window.addEventListener(
            eventType,
            (event) => {
                const extensionId = getExtensionId()
                if (!extensionId) {
                    return
                }

                /** @type {import('@/content/event-listeners/add').currentlyInterceptingEventSymbolName} */
                const symbolName = 'layerx-currently-intercepting-event'
                globalThis[Symbol.for(symbolName)] = event

                /** @type {import('@/content/event-listeners/types').InterceptedEventName} */
                const eventName = `layerx-${extensionId}-${eventType}`
                const interceptedEvent = new Event(eventName, { bubbles: true })
                const eventTarget = event.target ?? document
                eventTarget.dispatchEvent(interceptedEvent)

                globalThis[Symbol.for(symbolName)] = undefined
            },
            { capture: true, signal: abortController.signal }
        )
    })

    const livenessInterval = setInterval(() => {
        const extensionId = getExtensionId()
        if (!extensionId) {
            abortController.abort()
            return
        }

        /** @type {import('@/content/event-listeners/types').InterceptorLivenessEventName} */
        const eventName = `layerx-${extensionId}-events-interceptor-liveness`
        /** @type {import('@/content/event-listeners/types').InterceptorLivenessEvent} */
        const livenessEvent = new CustomEvent(eventName, {
            detail: { eventsToIntercept },
            bubbles: true,
        })
        document.dispatchEvent(livenessEvent)
    }, 3000)

    abortController.signal.addEventListener('abort', () => {
        clearInterval(livenessInterval)
    })
})()
