import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ThemeProvider} from "@/components/theme-provider";
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "@/providers/AuthProvider";


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <BrowserRouter>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
)
