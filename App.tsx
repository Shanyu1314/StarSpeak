import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppRoute } from './types';
import LookupPage from './pages/LookupPage';
import SOSPage from './pages/SOSPage';
import FreeTalkPage from './pages/FreeTalkPage';
import LoopDrillPage from './pages/LoopDrillPage';
import AuthPage from './pages/AuthPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './src/hooks/useAuth';
import { useLanguage, LanguageProvider } from './src/i18n/LanguageContext';
import { cn } from './lib/utils';

// Icons
const BookIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const SOSIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const ChatIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const DumbbellIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>;

const NavBar = () => {
  const { t } = useLanguage();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center justify-center gap-1 px-4 py-3 transition-all duration-200 rounded-xl relative",
      isActive
        ? 'text-sky-600'
        : 'text-slate-400 hover:text-slate-600'
    );

  return (
    <nav className="h-24 bg-white/95 backdrop-blur-xl border-t-2 border-border flex justify-around items-center z-50 shrink-0 pb-safe px-4 shadow-lg">
      <NavLink to={AppRoute.HOME} className={navClass}>
        {({ isActive }) => (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              isActive
                ? 'bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg scale-110'
                : 'bg-slate-100 hover:bg-slate-200'
            )}>
              <SOSIcon className={cn("w-6 h-6", isActive ? "text-white" : "")} />
            </div>
            <span className="text-xs font-semibold">{t('nav.sos')}</span>
            {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"></div>}
          </>
        )}
      </NavLink>
      <NavLink to={AppRoute.LOOKUP} className={navClass}>
        {({ isActive }) => (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              isActive
                ? 'bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg scale-110'
                : 'bg-slate-100 hover:bg-slate-200'
            )}>
              <BookIcon className={cn("w-6 h-6", isActive ? "text-white" : "")} />
            </div>
            <span className="text-xs font-semibold">{t('nav.lookup')}</span>
            {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"></div>}
          </>
        )}
      </NavLink>
      <NavLink to={AppRoute.DRILL} className={navClass}>
        {({ isActive }) => (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              isActive
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg scale-110'
                : 'bg-slate-100 hover:bg-slate-200'
            )}>
              <DumbbellIcon className={cn("w-6 h-6", isActive ? "text-white" : "")} />
            </div>
            <span className="text-xs font-semibold">{t('nav.drill')}</span>
            {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>}
          </>
        )}
      </NavLink>
      <NavLink to={AppRoute.TALK} className={navClass}>
        {({ isActive }) => (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              isActive
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg scale-110'
                : 'bg-slate-100 hover:bg-slate-200'
            )}>
              <ChatIcon className={cn("w-6 h-6", isActive ? "text-white" : "")} />
            </div>
            <span className="text-xs font-semibold">{t('nav.talk')}</span>
            {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>}
          </>
        )}
      </NavLink>
    </nav>
  );
};

const UserBar = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <div className="h-14 bg-white/95 backdrop-blur-xl border-b-2 border-border flex justify-between items-center px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-foreground">{user.email}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all duration-200",
              language === 'en'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all duration-200",
              language === 'zh'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            中文
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
        >
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/auth';
    
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {!isAuthPage && <UserBar />}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar">
                {children}
            </main>
            {!isAuthPage && <NavBar />}
        </div>
    )
}

const AppContent = () => {
  return (
    <HashRouter>
        <Layout>
          <Routes>
            <Route path={AppRoute.HOME} element={<AuthGuard><SOSPage /></AuthGuard>} />
            <Route path={AppRoute.LOOKUP} element={<AuthGuard><LookupPage /></AuthGuard>} />
            <Route path={AppRoute.DRILL} element={<AuthGuard><LoopDrillPage /></AuthGuard>} />
            <Route path={AppRoute.TALK} element={<AuthGuard><FreeTalkPage /></AuthGuard>} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </Layout>
    </HashRouter>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;