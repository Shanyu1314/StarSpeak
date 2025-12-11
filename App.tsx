import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppRoute } from './types';
import LookupPage from './pages/LookupPage';
import SOSPage from './pages/SOSPage';
import FreeTalkPage from './pages/FreeTalkPage';
import LoopDrillPage from './pages/LoopDrillPage';

// Icons
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const SOSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>; // Layers icon as placeholder
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const DumbbellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>;

const NavBar = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
      isActive ? 'text-space-accent' : 'text-slate-500 hover:text-slate-300'
    }`;

  return (
    <nav className="h-16 bg-space-800 border-t border-space-700 flex justify-around items-center z-50 shrink-0 safe-area-pb">
      <NavLink to={AppRoute.HOME} className={navClass}>
        <div className="p-1"><SOSIcon /></div>
        <span className="text-[10px] font-bold tracking-wider">SOS</span>
      </NavLink>
      <NavLink to={AppRoute.LOOKUP} className={navClass}>
        <div className="p-1"><BookIcon /></div>
        <span className="text-[10px] font-bold tracking-wider">LOOKUP</span>
      </NavLink>
      <NavLink to={AppRoute.DRILL} className={navClass}>
        <div className="p-1"><DumbbellIcon /></div>
        <span className="text-[10px] font-bold tracking-wider">DRILL</span>
      </NavLink>
      <NavLink to={AppRoute.TALK} className={navClass}>
        <div className="p-1"><ChatIcon /></div>
        <span className="text-[10px] font-bold tracking-wider">TALK</span>
      </NavLink>
    </nav>
  );
};

const App = () => {
  return (
    <HashRouter>
      <div className="flex flex-col h-full bg-space-900 text-slate-100">
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar">
          <Routes>
            <Route path={AppRoute.HOME} element={<SOSPage />} />
            <Route path={AppRoute.LOOKUP} element={<LookupPage />} />
            <Route path={AppRoute.DRILL} element={<LoopDrillPage />} />
            <Route path={AppRoute.TALK} element={<FreeTalkPage />} />
          </Routes>
        </main>
        <NavBar />
      </div>
    </HashRouter>
  );
};

export default App;
