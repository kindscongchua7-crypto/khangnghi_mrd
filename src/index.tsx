import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/css/index.css';
import { RouterProvider } from 'react-router';
import router from '@/router/paths';
import detectBot from '@/utils/detectBot';

const initApp = async () => {
    const botCheck = await detectBot();
    if (botCheck.isBot) {
        console.log('Bot detected:', botCheck.reason);
        return;
    }

    const rootEl = document.getElementById('root');
    if (rootEl) {
        const root = ReactDOM.createRoot(rootEl);
        root.render(
            <React.StrictMode>
                <RouterProvider router={router} />
            </React.StrictMode>
        );
    }
};

initApp();
