/* eslint-disable no-undef */
const params = new URLSearchParams(document.location.search)
const host = params.get('host')
const isByPassable = JSON.parse(params.get('bypassable') || 'false')
const blockedUrl = params.get('blockedUrl')
const policyId = params.get('policyId')
const evaluationId = params.get('evaluationId')
const companyLogo = params.get('companyLogo')
const content = params.get('content')
const conditionHash = params.get('conditionHash') || ''
const redirectPage = document.querySelector('lit-redirect-page')
const isPhishingPolicy = JSON.parse(params.get('isPhishingPolicy') || 'false')
const hideUnauthorizedLogo = JSON.parse(params.get('hideUnauthorizedLogo') || 'false')
const justificationOptions = params.getAll('justificationOptions')
const justificationOther = JSON.parse(params.get('justificationOther'))
const justificationAlertMessage = params.get('justificationAlertMessage') || ''

// ALERT MESSAGE
if (content) {
    redirectPage.content = content
}

// BLOCKED WEBSITE
redirectPage.blockedWebsite = host

// COMPANY LOGO
redirectPage.companyLogo = companyLogo

// BACK TO SAFETY
redirectPage.addEventListener('backToSafety', () => (window.location.href = 'https://google.com'))

// BYPASS
redirectPage.isByPassable = isByPassable
redirectPage.hideUnauthorizedLogo = hideUnauthorizedLogo

if (justificationOptions.length) {
    redirectPage.justificationOptions = justificationOptions
    redirectPage.justificationOther = justificationOther
    redirectPage.justificationAlertMessage = justificationAlertMessage
}
if (isByPassable) {
    const handleBypass = (justification) => {
        // only show mark as safe for phishing policies
        if (isPhishingPolicy) {
            chrome.runtime.sendMessage({
                type: 'show-mark-safe-alert',
                url: blockedUrl,
                host,
            })
        }

        chrome.runtime.sendMessage({
            type: 'publish-user-interaction-event',
            data: {
                policyId,
                alertId: evaluationId,
                action: 'bypass',
                url: host,
                content: justification || undefined,
            },
        })
        chrome.runtime
            .sendMessage({
                type: 'policy-bypass',
                data: {
                    policyId,
                    host,
                    conditionHash,
                    isPhishing: isPhishingPolicy,
                    justification,
                },
            })
            .then(() => {
                setTimeout(() => {
                    window.location.href = blockedUrl
                }, 300)
            })
    }
    redirectPage.addEventListener('bypass', (event) => handleBypass(event?.detail?.justification))
}
