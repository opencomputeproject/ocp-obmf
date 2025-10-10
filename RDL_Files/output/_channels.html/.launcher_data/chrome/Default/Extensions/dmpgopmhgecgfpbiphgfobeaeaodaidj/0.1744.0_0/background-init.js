/* eslint-disable no-undef */

/** @type {Record<string, Promise<any> | undefined>} */
globalThis.importsCache = globalThis['importsCache'] ?? {}

/**
 * @param {string} filePath
 * @returns {Promise<void>}
 */
globalThis.dynamicImport = async (filePath) => {
    if (globalThis.importsCache[filePath]) {
        await globalThis.importsCache[filePath]
        return
    }

    if (globalThis.importScripts) {
        globalThis.importScripts(filePath)
        globalThis.importsCache[filePath] = Promise.resolve()
        return
    }

    const script = document.createElement('script')
    script.src = filePath
    const promise = new Promise((resolve, reject) => {
        script.onload = () => {
            resolve(undefined)
        }
        script.onerror = (error) => {
            reject(error)
        }
    })
    document.head.appendChild(script)
    globalThis.importsCache[filePath] = promise
    await promise
}

const start = async () => {
    const filesToImport = ['background/main.js', 'background/runtime.js', 'background/dependencies.js']

    const promises = filesToImport.map(globalThis.dynamicImport)
    await Promise.all(promises)
}

if (!globalThis.bgRunning) {
    start()
}
