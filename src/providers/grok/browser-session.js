function tryParseJsonObject(rawValue) {
    if (typeof rawValue !== 'string') return null;
    const trimmed = rawValue.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
    try {
        const parsed = JSON.parse(trimmed);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function parseCookieHeader(rawCookieHeader) {
    const cookies = {};
    if (!rawCookieHeader || typeof rawCookieHeader !== 'string') return cookies;

    const parsedObject = tryParseJsonObject(rawCookieHeader);
    if (parsedObject) {
        for (const [name, value] of Object.entries(parsedObject)) {
            if (value === undefined || value === null) continue;
            cookies[String(name).trim()] = String(value).trim();
        }
        return cookies;
    }

    rawCookieHeader.split(';').forEach((segment) => {
        const trimmed = segment.trim();
        if (!trimmed) return;
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex <= 0) return;
        const name = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        if (!name || !value) return;
        cookies[name] = value;
    });
    return cookies;
}

export function buildGrokCookieMap(config = {}, ssoToken = '') {
    const cookies = {};
    let normalizedSsoToken = ssoToken || config.GROK_COOKIE_TOKEN || '';
    if (normalizedSsoToken.startsWith('sso=')) {
        normalizedSsoToken = normalizedSsoToken.slice(4);
    }

    if (normalizedSsoToken) {
        cookies.sso = normalizedSsoToken;
        cookies['sso-rw'] = normalizedSsoToken;
    }

    if (config.GROK_CF_CLEARANCE) {
        cookies.cf_clearance = config.GROK_CF_CLEARANCE;
    }

    Object.assign(cookies, parseCookieHeader(config.GROK_EXTRA_COOKIES));
    return cookies;
}

export function buildGrokCookieHeader(config = {}, ssoToken = '') {
    const cookies = buildGrokCookieMap(config, ssoToken);
    return Object.entries(cookies)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
        .map(([name, value]) => `${name}=${String(value).trim()}`)
        .join('; ');
}

export function getDefaultGrokBrowserHeaders(config = {}, baseUrl = 'https://grok.com') {
    return {
        accept: '*/*',
        'accept-language': config.GROK_ACCEPT_LANGUAGE || 'en-US,en;q=0.9',
        'content-type': 'application/json',
        origin: baseUrl,
        priority: config.GROK_PRIORITY || 'u=1, i',
        referer: config.GROK_REFERER || `${baseUrl}/`,
        'sec-ch-ua': config.GROK_SEC_CH_UA || '"Microsoft Edge";v="148", "Chromium";v="148", "Not=A?Brand";v="24"',
        'sec-ch-ua-arch': config.GROK_SEC_CH_UA_ARCH || '"arm"',
        'sec-ch-ua-bitness': config.GROK_SEC_CH_UA_BITNESS || '"64"',
        'sec-ch-ua-full-version': config.GROK_SEC_CH_UA_FULL_VERSION || '"148.0.3967.54"',
        'sec-ch-ua-full-version-list': config.GROK_SEC_CH_UA_FULL_VERSION_LIST || '"Microsoft Edge";v="148.0.3967.54", "Chromium";v="148.0.3967.54", "Not=A?Brand";v="24.0.0.0"',
        'sec-ch-ua-mobile': config.GROK_SEC_CH_UA_MOBILE || '?0',
        'sec-ch-ua-model': config.GROK_SEC_CH_UA_MODEL || '""',
        'sec-ch-ua-platform': config.GROK_SEC_CH_UA_PLATFORM || '"macOS"',
        'sec-ch-ua-platform-version': config.GROK_SEC_CH_UA_PLATFORM_VERSION || '"15.0.0"',
        'sec-fetch-dest': config.GROK_SEC_FETCH_DEST || 'empty',
        'sec-fetch-mode': config.GROK_SEC_FETCH_MODE || 'cors',
        'sec-fetch-site': config.GROK_SEC_FETCH_SITE || 'same-origin',
        'user-agent': config.GROK_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    };
}

