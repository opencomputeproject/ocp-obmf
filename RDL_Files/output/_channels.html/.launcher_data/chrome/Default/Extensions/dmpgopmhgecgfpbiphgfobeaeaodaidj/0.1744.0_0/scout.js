try {
    let isSameOrigin
    try {
        // Cross origin frames cannot access window.top
        isSameOrigin = !!window.top.document
    } catch (e) {
        isSameOrigin = false
    }

    const message = {
        type: 'scout',
        url: document.URL,
        textContentLength: document.body?.textContent?.length || 0,
        isSameOrigin,
    }

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            // eslint-disable-next-line no-undef
            chrome?.runtime?.sendMessage(message)
        }
    }

    if (document.visibilityState === 'visible') {
        // eslint-disable-next-line no-undef
        chrome?.runtime?.sendMessage(message)
    } else {
        document.addEventListener('visibilitychange', handleVisibilityChange)
    }
} catch (error) {
    console.error('Failed to run canary script', error)
    // eslint-disable-next-line no-undef
    chrome?.runtime?.sendMessage({ ...message, type: 'scout-error', errorMessage: error.message })
}
