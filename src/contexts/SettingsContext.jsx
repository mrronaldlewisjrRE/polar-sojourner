import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Initialize from localStorage or default to true
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('cdh_settings');
        return saved ? JSON.parse(saved) : {
            teamChatSound: true,
            privateChatSound: true,
            systemSound: true
        };
    });

    useEffect(() => {
        localStorage.setItem('cdh_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, toggleSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};
