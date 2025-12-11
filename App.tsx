import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppRoute } from './types';
import LookupPage from './pages/LookupPage';
import SOSPage from './pages/SOSPage';
import FreeTalkPage from './pages/FreeTalkPage';
import LoopDrillPage from './pages/LoopDrillPage';
import AuthPage from './pages/AuthPage';
import { cn } from './lib/utils';

// Icons
const BookIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const SOSIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const ChatIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const DumbbellIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>;

const NavBar = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center justify-center w-full h-full transition-all duration-300 rounded-lg mx-1",
      isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
    );

  return (
    <nav className="h-20 bg-card/80 backdrop-blur-lg border-t border-border flex justify-around items-center z-50 shrink-0 pb-safe px-2 pb-2">
      <NavLink to={AppRoute.HOME} className={navClass}>
        <div className="p-1"><SOSIcon className="w-6 h-6" /></div>
        <span className="text-[10px] font-bold tracking-wider">SOS</span>
      </NavLink>
      <NavLink to={AppRoute.LOOKUP} className={navClass}>
        <div className="p-1"><BookIcon className="w-6 h-6" /></div>
        <span className="text-[10px] font-bold tracking-wider">LOOKUP</span>
      </NavLink>
      <NavLink to={AppRoute.DRILL} className={navClass}>
        <div className="p-1"><DumbbellIcon className="w-6 h-6" /></div>
        <span className="text-[10px] font-bold tracking-wider">DRILL</span>
      </NavLink>
      <NavLink to={AppRoute.TALK} className={navClass}>
        <div className="p-1"><ChatIcon className="w-6 h-6" /></div>
        <span className="text-[10px] font-bold tracking-wider">TALK</span>
      </NavLink>
    </nav>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/auth';
    
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar">
                {children}
            </main>
            {!isAuthPage && <NavBar />}
        </div>
    )
}

const App = () => {
  return (
    <HashRouter>
        <Layout>
          <Routes>
            <Route path={AppRoute.HOME} element={<SOSPage />} />
            <Route path={AppRoute.LOOKUP} element={<LookupPage />} />
            <Route path={AppRoute.DRILL} element={<LoopDrillPage />} />
            <Route path={AppRoute.TALK} element={<FreeTalkPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </Layout>
    </HashRouter>
  );
};

export default App;