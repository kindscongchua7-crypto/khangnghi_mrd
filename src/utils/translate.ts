const translateText = async (text: string, targetLang: string = ''): Promise<string> => {
    try {
        const targetLangs = {
            KR: 'ko',
            JP: 'ja',
            CN: 'zh',
            SA: 'ar',
            BR: 'pt-BR',
            FR: 'fr',
            IT: 'it',
            US: 'en',
            ID: 'id',
            DE: 'de',
            VN: 'vi',
            IN: 'hi',
            TH: 'th',
            MY: 'ms',
            PH: 'tl',
            SG: 'en',
            AU: 'en',
            CA: 'en',
            GB: 'en',
            ES: 'es',
            NL: 'nl',
            SE: 'sv',
            NO: 'no',
            DK: 'da',
            FI: 'fi',
            PL: 'pl',
            RU: 'ru',
            TR: 'tr',
            GR: 'el',
            PT: 'pt',
            MX: 'es',
            AR: 'es',
            CL: 'es',
            CO: 'es',
            PE: 'es',
            EG: 'ar',
            NG: 'en',
            ZA: 'en',
            KE: 'en',
            GH: 'en',
            MA: 'ar',
            TN: 'ar',
            DZ: 'ar',
            LY: 'ar',
            SD: 'ar',
            IQ: 'ar',
            IR: 'fa',
            PK: 'ur',
            BD: 'bn',
            LK: 'si',
            NP: 'ne',
            MM: 'my',
            KH: 'km',
            LA: 'lo'
        };
        if (!targetLangs[targetLang as keyof typeof targetLangs]) {
            return text;
        }
        const encodedText = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangs[targetLang as keyof typeof targetLangs]}&dt=t&q=${encodedText}`;

        const response = await fetch(url);
        const data: unknown = await response.json();

        if (Array.isArray(data) && Array.isArray(data[0])) {
            const translatedParts = data[0] as Array<[string, string, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
            const translatedText = translatedParts.map((part) => part[0]).join('');
            return translatedText.trim();
        }
        console.clear();
        return text;
    } catch {
        console.clear();
        return text;
    }
};
export default translateText;
