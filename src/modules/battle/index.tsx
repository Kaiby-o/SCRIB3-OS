// ===== SCRIB3 Battle Module =====
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './battle.tokens.css';

const TeamSelectScreen = lazy(() => import('./components/Screens/TeamSelectScreen'));
const BattleScreen = lazy(() => import('./components/Screens/BattleScreen'));
const BattleLobby = lazy(() => import('./components/Screens/BattleLobby'));

const Loader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--battle-bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--battle-pink)', textTransform: 'uppercase', letterSpacing: '2px' }}>Loading Battle...</span>
  </div>
);

const BattleModule: React.FC = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route index element={<BattleLobby />} />
      <Route path="team-select" element={<TeamSelectScreen />} />
      <Route path="fight" element={<BattleScreen />} />
      <Route path="*" element={<Navigate to="/battle" replace />} />
    </Routes>
  </Suspense>
);

export default BattleModule;
