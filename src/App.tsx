import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, SenseiRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { SelectSenseiPage } from './pages/SelectSenseiPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutSessionPage } from './pages/WorkoutSessionPage';
import { WorkoutBuilderPage } from './pages/WorkoutBuilderPage';
import { BattleLogPage } from './pages/BattleLogPage';
import { SkillTreePage } from './pages/SkillTreePage';
import { LimitBreakOverlay } from './components/effects/LimitBreakOverlay';
import { AchievementToast } from './components/effects/AchievementToast';

function App() {
  return (
    <>
      <LimitBreakOverlay />
      <AchievementToast />
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          {/* Users go here if they have no sensei yet */}
          <Route element={<SenseiRoute />}>
            <Route path="/select-sensei" element={<SelectSenseiPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workout" element={<WorkoutSessionPage />} />
            <Route path="/build" element={<WorkoutBuilderPage />} />
            <Route path="/history" element={<BattleLogPage />} />
            <Route path="/skills" element={<SkillTreePage />} />
          </Route>

          {/* Default catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
