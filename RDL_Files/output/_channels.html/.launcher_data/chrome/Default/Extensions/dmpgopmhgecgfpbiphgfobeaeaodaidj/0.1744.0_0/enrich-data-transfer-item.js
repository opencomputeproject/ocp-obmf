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

    const cleanupSymbol = Symbol.for('layerx-enrich-data-transfer-item-cleanup')

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

    const enrichDataTransferItemEntry = () => {
        if (!('webkitGetAsEntry' in DataTransferItem.prototype)) {
            return
        }

        /** @type {WeakMap<File, FileSystemEntry>} */
        const fileToEntry = new WeakMap()

        /** @type {import('@/content/synthetic-upload/async-event/constants').PRE_DROP_EVENT_NAME} */
        const PRE_DROP_EVENT_NAME = 'layer-x-pre-drop'
        /** @param {DragEvent} event */
        const onPreDrop = (event) => {
            const items = [...(event.dataTransfer?.items || [])]
            const itemToEntry = items
                .map((item) => {
                    const file = item.getAsFile()
                    const entry = item.webkitGetAsEntry()
                    if (!file || !entry) {
                        return null
                    }
                    return { file, entry }
                })
                .filter(Boolean)

            /** @type {import('@/content/synthetic-upload/async-event/constants').PRE_DROP_RESULT_EVENT_NAME} */
            const PRE_DROP_RESULT_EVENT_NAME = 'layer-x-pre-drop-result'
            /** @type {import('@/content/synthetic-upload/async-event/types').DropResultEvent} */
            const preDropResultEvent = new CustomEvent(PRE_DROP_RESULT_EVENT_NAME, {
                detail: {
                    uploadId: event.detail,
                    itemsCount: items.length,
                    entryCount: itemToEntry.filter(({ entry }) => !!entry).length,
                },
            })
            document.dispatchEvent(preDropResultEvent)

            itemToEntry.forEach(({ file, entry }) => {
                fileToEntry.set(file, entry)
            })
        }
        document.addEventListener(PRE_DROP_EVENT_NAME, onPreDrop)

        const originalGetAsEntry = DataTransferItem.prototype.webkitGetAsEntry
        DataTransferItem.prototype.webkitGetAsEntry = function () {
            try {
                const file = this.getAsFile()
                if (file && fileToEntry.has(file)) {
                    return fileToEntry.get(file)
                }
                return originalGetAsEntry.call(this)
            } catch {
                return originalGetAsEntry.call(this)
            }
        }

        /** @param {DragEvent} event */
        const onDrop = (event) => {
            /** If we don't have uploadId, there is no need for the monitor to run. */
            if (!event.detail) {
                return
            }

            const items = [...(event.dataTransfer?.items || [])]
            const itemsWithEntries = items.filter((item) => !!item.webkitGetAsEntry())

            /** @type {import('@/content/synthetic-upload/async-event/constants').SYNTHETIC_DROP_RESULT_EVENT_NAME} */
            const SYNTHETIC_DROP_RESULT_EVENT_NAME = 'layer-x-synthetic-drop-result'
            /** @type {import('@/content/synthetic-upload/async-event/types').DropResultEvent} */
            const syntheticDropResultEvent = new CustomEvent(SYNTHETIC_DROP_RESULT_EVENT_NAME, {
                detail: {
                    uploadId: event.detail,
                    itemsCount: items.length,
                    entryCount: itemsWithEntries.length,
                },
            })
            document.dispatchEvent(syntheticDropResultEvent)
        }
        document.addEventListener('drop', onDrop, { capture: true })

        addCleanupCallback(() => {
            document.removeEventListener('drop', onDrop, { capture: true })
            document.removeEventListener(PRE_DROP_EVENT_NAME, onPreDrop)
            DataTransferItem.prototype.webkitGetAsEntry = originalGetAsEntry
        })
    }

    try {
        enrichDataTransferItemEntry()
    } catch (error) {
        emitErrorLog('Failed to init enrich data transfer item logic', { error })
    }
})()
