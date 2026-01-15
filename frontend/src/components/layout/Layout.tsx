import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Pill, Activity, CalendarClock, Menu, Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: t('layout.dashboard') },
        { to: '/medicines', icon: Pill, label: t('layout.medicines') },
        { to: '/diseases', icon: Activity, label: t('layout.diseases') },
        { to: '/prescriptions', icon: CalendarClock, label: t('layout.prescriptions') },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
                <div className="p-6 flex items-center space-x-2 border-b border-gray-100">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{t('layout.title')}</span>
                </div>

                <div className="px-6 py-4">
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                        <Languages className="w-4 h-4 text-gray-500" />
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`text-sm font-medium ${i18n.language === 'en' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            EN
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => changeLanguage('vi')}
                            className={`text-sm font-medium ${i18n.language === 'vi' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            VI
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <div className="px-4 pb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {t('layout.welcome')}
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3 transition-colors" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <span className="text-lg font-bold">{t('layout.title')}</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg p-4 space-y-2">
                        <div className="flex items-center space-x-4 p-2 mb-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">{t('layout.language')}:</span>
                            <button onClick={() => changeLanguage('en')} className={`text-sm font-bold ${i18n.language === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>EN</button>
                            <button onClick={() => changeLanguage('vi')} className={`text-sm font-bold ${i18n.language === 'vi' ? 'text-blue-600' : 'text-gray-400'}`}>VI</button>
                        </div>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `flex items-center p-3 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
