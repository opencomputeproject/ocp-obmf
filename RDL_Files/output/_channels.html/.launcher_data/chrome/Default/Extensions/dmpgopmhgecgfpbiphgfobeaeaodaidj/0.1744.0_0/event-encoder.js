/* eslint-disable @typescript-eslint/no-this-alias */
;(() => {
    /**
     * @param {Event} event
     * @param {EventTarget} target
     * @returns {Event}
     */
    const newEventEncoder = (event, target) => {
        return event
    }

    const encoderSymbol = Symbol.for('layerx-event-encoder')
    /**
     * @returns {((event: Event, target: EventTarget) => Event) | undefined}
     */
    const getCurrentEventEncoder = () => {
        return window[encoderSymbol]
    }

    const currentEventEncoder = getCurrentEventEncoder()

    window[encoderSymbol] = newEventEncoder

    // If there is already an event interceptor, we don't need to override the event listener,
    // it will use the updated encoder anyway.
    if (currentEventEncoder) {
        return
    }

    const originalAddEventListener = EventTarget.prototype.addEventListener
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener

    /**
     * Map that stores target to original event listener references to their overrides.
     * We store it in an array of type and options, because you can have multiple listeners for different
     * types and options, and we need to remove the correct one.
     *
     * @type { WeakMap<EventTarget,
     *     WeakMap<
     *         EventListenerOrEventListenerObject,
     *         {
     *             type: string,
     *             capture: boolean,
     *             overrideCallback: (event: Event) => void
     *         }[]
     *     >
     * > }
     */
    const targetToCallbacksMap = new WeakMap()

    /**
     * @param {AddEventListenerOptions | boolean | undefined | null} options
     * @returns {boolean}
     */
    const getCaptureFromOptions = (options) => {
        if (typeof options === 'object' && options !== null) {
            return options.capture ?? false
        }

        return !!options
    }

    /**
     * @param {string} message
     * @param {import('../src/types/logger').LogAdditionalParams} additionalParams
     */
    const emitErrorLog = (message, additionalParams) => {
        document.dispatchEvent(
            new CustomEvent('layerx-log', {
                detail: {
                    type: 'error',
                    message,
                    additionalParams,
                },
            })
        )
    }

    /**
     * @type {typeof EventTarget.prototype.addEventListener}
     */
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        /**
         * @type {EventListenerOrEventListenerObject}
         */
        const callback = (event) => {
            try {
                const encoder = getCurrentEventEncoder()
                const encodedEvent = encoder ? encoder(event, this) : event

                if (typeof listener === 'function') {
                    // When it's a function, the `this` is the event target, so we need to call the function with the correct `this`.
                    return listener.call(this, encodedEvent)
                } else if (
                    typeof listener === 'object' &&
                    listener !== null &&
                    typeof listener.handleEvent === 'function'
                ) {
                    // When it's handleEvent, the `this` is the listener object, so no need for `call`.
                    return listener.handleEvent(encodedEvent)
                } else if (listener === null) {
                    // It can be null :)
                    return
                } else {
                    emitErrorLog('Listener is not a function or object with handleEvent method', {
                        context: { listenerType: String(listener) },
                    })
                }
            } catch (error) {
                emitErrorLog('Error in listener', { error })
                throw error
            }
        }

        try {
            if (listener !== null) {
                const newCallback = {
                    type,
                    capture: getCaptureFromOptions(options),
                    overrideCallback: callback,
                }

                if (!targetToCallbacksMap.has(this)) {
                    targetToCallbacksMap.set(this, new WeakMap())
                }
                const callbacksMap = targetToCallbacksMap.get(this)

                const storedListeners = callbacksMap?.get(listener)
                if (storedListeners) {
                    const existingListener = storedListeners.find(
                        (listener) => listener.type === type && listener.capture === getCaptureFromOptions(options)
                    )

                    if (!existingListener) {
                        storedListeners.push(newCallback)
                    }

                    /**
                     * Per spec, when calling addEventListener with the same listener, type and capture option, it should not add a new listener.
                     * The only thing it does, is if the options have abort signal, it adds it to the existing listener.
                     *
                     * To mimic this behavior, we need to call the original addEventListener with the existing listener's callback, but with the new
                     * options, and let the browser do the rest.
                     */
                    return originalAddEventListener.call(
                        this,
                        type,
                        existingListener?.overrideCallback ?? callback,
                        options
                    )
                }

                callbacksMap?.set(listener, [newCallback])
                return originalAddEventListener.call(this, type, callback, options)
            }
        } catch (error) {
            emitErrorLog('Error while adding event listener', { error })
            throw error
        }
    }

    /**
     * @type {typeof EventTarget.prototype.removeEventListener}
     */
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
        try {
            if (!targetToCallbacksMap.has(this)) {
                targetToCallbacksMap.set(this, new WeakMap())
            }
            const callbacksMap = targetToCallbacksMap.get(this)

            const storedListeners = listener && callbacksMap?.get(listener)
            const relevantListener = storedListeners?.find(
                (listener) => listener.type === type && listener.capture === getCaptureFromOptions(options)
            )

            if (!storedListeners || !relevantListener) {
                return originalRemoveEventListener.call(this, type, listener, options)
            }

            if (storedListeners.length === 1) {
                callbacksMap?.delete(listener)
            } else {
                storedListeners.splice(storedListeners.indexOf(relevantListener), 1)
            }

            return originalRemoveEventListener.call(this, type, relevantListener.overrideCallback, options)
        } catch (error) {
            emitErrorLog('Error while removing event listener', { error })
            throw error
        }
    }
})()
