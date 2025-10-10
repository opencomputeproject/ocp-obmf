;(() => {
    /**
     * @param {string} message
     * @param {import('../src/types/logger').LogAdditionalParams} additionalParams
     */
    const emitErrorLog = (message, additionalParams) => {
        /**
         * @type {import('@/content/logger-handler/types').LogEvent}
         */
        const logEvent = new CustomEvent('layerx-log', {
            detail: {
                type: 'error',
                message,
                additionalParams,
            },
        })
        document.dispatchEvent(logEvent)
    }

    const cleanupSymbol = Symbol.for('layerx-main-world-content-cleanup')

    // Cleanup old main world content logic
    try {
        const cleanupCallbacks = window[cleanupSymbol] || []
        window[cleanupSymbol] = []
        cleanupCallbacks.forEach((cb) => {
            try {
                cb()
            } catch (error) {
                emitErrorLog('Single old extension logic cleanup callback failed', { error })
            }
        })
    } catch (error) {
        emitErrorLog('Failed to cleanup old extension logic', { error })
    }

    /** @param {() => void} callback */
    const addCleanupCallback = (callback) => {
        const cleanupCallbacks = window[cleanupSymbol] || []
        cleanupCallbacks.push(callback)
        window[cleanupSymbol] = cleanupCallbacks
    }

    const overrideNavigatorClipboard = () => {
        if (!window.navigator?.clipboard?.writeText) {
            return
        }

        const originalClipboardWriteText = window.navigator.clipboard.writeText
        window.navigator.clipboard.writeText = async (text) => {
            const clipboardWriteTextEvent = new CustomEvent('navigatorClipboardWriteText', {
                detail: { text },
                cancelable: true,
            })
            document.dispatchEvent(clipboardWriteTextEvent)

            if (!clipboardWriteTextEvent.defaultPrevented) {
                return originalClipboardWriteText.call(window.navigator.clipboard, text)
            }
        }
        const ua = navigator.userAgent.toLowerCase()
        const isSafari = ua.includes('safari') && !ua.includes('chrome') // Check if current browser is Safari, no permissions to read clipboard
        if (isSafari) return

        const originalClipboardWrite = window.navigator.clipboard.write
        window.navigator.clipboard.write = async (items) => {
            try {
                const textItems = items.flatMap((item) =>
                    item.types
                        .filter((type) => type.startsWith('text/'))
                        .map((type) => ({
                            item,
                            type,
                        }))
                )

                const textArray = await Promise.all(
                    textItems.map(async ({ item, type }) => {
                        try {
                            const blob = await item.getType(type)
                            return await blob.text()
                        } catch (err) {
                            console.error('Failed to extract text from clipboard item:', err)
                            return
                        }
                    })
                )
                const text = textArray.filter(Boolean).join('\n')

                const clipboardWriteTextEvent = new CustomEvent('navigatorClipboardWriteText', {
                    detail: { text },
                    cancelable: true,
                })
                document.dispatchEvent(clipboardWriteTextEvent)

                if (!clipboardWriteTextEvent.defaultPrevented) {
                    return originalClipboardWrite.call(window.navigator.clipboard, items)
                }
            } catch (error) {
                console.error('Error occurred in navigator clipboard write override', error)
                return originalClipboardWrite.call(window.navigator.clipboard, items)
            }
        }

        addCleanupCallback(() => {
            window.navigator.clipboard.writeText = originalClipboardWriteText
            window.navigator.clipboard.write = originalClipboardWrite
        })
    }

    try {
        overrideNavigatorClipboard()
    } catch (error) {
        emitErrorLog('Failed to init override logic', { error })
    }
})()
