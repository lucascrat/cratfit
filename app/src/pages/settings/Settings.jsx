import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../../components/common/TopAppBar';
import Card from '../../components/common/Card';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';

const Settings = () => {
    const navigate = useNavigate();
    const { settings, toggleTheme, toggleNotifications, toggleCoach } = useSettingsStore();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    const sections = [
        {
            title: 'Aplicativo',
            items: [
                {
                    label: 'Tema Escuro',
                    type: 'toggle',
                    value: settings.theme === 'dark',
                    action: toggleTheme
                },
                {
                    label: 'Notificações',
                    type: 'toggle',
                    value: settings.notificationsEnabled,
                    action: toggleNotifications
                }
            ]
        },
        {
            title: 'Treino',
            items: [
                {
                    label: 'Treinador Virtual (IA)',
                    type: 'toggle',
                    value: settings.coachEnabled,
                    action: toggleCoach
                },
                {
                    label: 'Voz do Treinador',
                    type: 'link',
                    value: settings.coachVoice,
                    action: () => navigate('/settings/voice')
                },
                {
                    label: 'Unidades de Medida',
                    type: 'value',
                    value: 'Métrico (km)',
                    action: () => { }
                }
            ]
        },
        {
            title: 'Dispositivos',
            items: [
                {
                    label: 'Conectar Garmin/Strava',
                    type: 'link',
                    action: () => navigate('/settings/devices')
                },
                {
                    label: 'Gerenciar Equipamentos',
                    type: 'link',
                    action: () => navigate('/settings/equipment')
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <TopAppBar title="Configurações" showBack />

            <main className="px-4 pt-2 flex flex-col gap-6">
                {sections.map((section, idx) => (
                    <section key={idx}>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            {section.title}
                        </h3>
                        <Card padding="none" className="overflow-hidden">
                            {section.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    onClick={item.type === 'link' ? item.action : undefined}
                                    className={`
                    flex items-center justify-between p-4 bg-white dark:bg-surface-dark
                    ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}
                    ${item.type === 'link' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10' : ''}
                  `}
                                >
                                    <span className="text-slate-900 dark:text-white font-medium">{item.label}</span>

                                    {item.type === 'toggle' && (
                                        <label className="custom-toggle relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.value}
                                                onChange={item.action}
                                            />
                                            <div className="w-12 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer transition-colors duration-300 ease-in-out">
                                                <div className="toggle-dot absolute top-1 left-1 bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-300 ease-in-out shadow-sm"></div>
                                            </div>
                                        </label>
                                    )}

                                    {item.type === 'link' && (
                                        <div className="flex items-center text-gray-400">
                                            {item.value && <span className="mr-2 text-sm">{item.value}</span>}
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </div>
                                    )}

                                    {item.type === 'value' && (
                                        <span className="text-gray-400 text-sm">{item.value}</span>
                                    )}
                                </div>
                            ))}
                        </Card>
                    </section>
                ))}

                <button
                    onClick={handleLogout}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sair da Conta
                </button>

                <p className="text-center text-xs text-gray-400 mb-4">
                    Versão 1.0.0 (Build 42)
                </p>
            </main>
        </div>
    );
};

export default Settings;
