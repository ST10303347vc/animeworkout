import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, SenseiRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { SelectSenseiPage } from './pages/SelectSenseiPage';
import { MainShell } from './components/layout/MainShell';
import { HubDashboard } from './pages/HubDashboard';
import { PhysicalDungeonPage } from './pages/PhysicalDungeonPage';
import { WorkoutSessionPage } from './pages/WorkoutSessionPage';
import { WorkoutBuilderPage } from './pages/WorkoutBuilderPage';
import { BattleLogPage } from './pages/BattleLogPage';
import { SkillTreePage } from './pages/SkillTreePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LimitBreakOverlay } from './components/effects/LimitBreakOverlay';
import { AchievementToast } from './components/effects/AchievementToast';
import { TaskLoggerPage } from './pages/TaskLoggerPage';
import { HabitTrackerPage } from './pages/HabitTrackerPage';
import { ProfilePage } from './pages/ProfilePage';

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
            {/* Main Tabs wrapped in MainShell */}
            <Route element={<MainShell />}>
              <Route path="/hub" element={<HubDashboard />} />
              <Route path="/physical" element={<PhysicalDungeonPage />} />
              <Route path="/mental" element={<TaskLoggerPage pillar="mental" />} />
              <Route path="/wealth" element={<TaskLoggerPage pillar="wealth" />} />
              <Route path="/vitality" element={<HabitTrackerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Direct Full-Screen Routes (No Tabs) */}
            <Route path="/workout" element={<WorkoutSessionPage />} />
            <Route path="/build" element={<WorkoutBuilderPage />} />
            <Route path="/history" element={<BattleLogPage />} />
            <Route path="/skills" element={<SkillTreePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Default catch-all */}
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
