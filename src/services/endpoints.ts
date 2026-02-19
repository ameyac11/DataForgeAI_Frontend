export const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    GOOGLE_AUTH: '/auth/google',
    GITHUB_AUTH: '/auth/github',
    ONBOARDING_COMPLETE: '/auth/onboarding/complete',
    ONBOARDING_STATUS: '/auth/onboarding/status',

    // Chat
    CHAT_SEND: '/chat/send',
    CHAT_HISTORY: '/chat/history',
    CHAT_MESSAGES: (chatId: string) => `/chat/${chatId}/messages`,
    CHAT_RENAME: (chatId: string) => `/chat/${chatId}/rename`,
    CHAT_STAR: (chatId: string) => `/chat/${chatId}/star`,
    CHAT_PIN: (chatId: string) => `/chat/${chatId}/pin`,
    CHAT_DELETE: (chatId: string) => `/chat/${chatId}`,
    CHAT_DOWNLOAD: (chatId: string) => `/chat/${chatId}/download`,
    CHAT_CREATE: '/chat',

    // Generator
    GENERATE_PREVIEW: '/generate/preview',
    GENERATE_DOWNLOAD: '/generate/download',
    GENERATE_COLUMNS: '/generate/columns',

    // Misc
    TEMPLATES: '/templates',
    HEALTH: '/health',
};
