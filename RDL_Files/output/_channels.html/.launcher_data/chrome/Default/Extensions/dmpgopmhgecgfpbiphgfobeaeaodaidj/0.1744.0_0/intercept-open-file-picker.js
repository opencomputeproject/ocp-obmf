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

    const cleanupSymbol = Symbol.for('layerx-intercept-open-file-picker-cleanup')

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

    const overrideOpenFilePicker = () => {
        if (!('showOpenFilePicker' in window)) {
            return
        }

        const originalShowOpenFilePicker = window.showOpenFilePicker

        /** @param {OpenFilePickerOptions | undefined} options */
        window.showOpenFilePicker = (options) => {
            return originalShowOpenFilePicker(options).then(async (fileHandlers) => {
                const files = await Promise.all(fileHandlers.map((fileHandler) => fileHandler.getFile()))
                const expectedResponseEventName = `filePickerUploadResponse-${Math.random()}-${Date.now()}`

                const uploadEvaluationResponsePromise = new Promise((resolve, reject) => {
                    document.addEventListener(
                        expectedResponseEventName,
                        /**
                         * @param {import('../src/common/upload/types').FilePickerUploadResponseEvent} event
                         */
                        (event) => {
                            const hasBlocked = event.detail.hasBlocked
                            if (hasBlocked) {
                                reject(new DOMException('The operation was aborted.', 'AbortError'))
                            } else {
                                resolve(fileHandlers)
                            }
                        },
                        { capture: true, once: true }
                    )
                })

                /** @type {import('@/common/upload/types').FilePickerUploadEvent} */
                const filePickerUploadEvent = new CustomEvent('filePickerUpload', {
                    detail: { files, expectedResponseEventName },
                    cancelable: true,
                })
                document.dispatchEvent(filePickerUploadEvent)

                return uploadEvaluationResponsePromise
            })
        }

        addCleanupCallback(() => {
            window.showOpenFilePicker = originalShowOpenFilePicker
        })
    }

    try {
        overrideOpenFilePicker()
    } catch (error) {
        emitErrorLog('Failed to init intercept open file picker logic', { error })
    }
})()
