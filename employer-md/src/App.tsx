import { useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './state/store';
import { ToastProvider } from './components/Toast';
import { AppLayout } from './components/Layout';
import type { Role } from './types';
import Welcome from './pages/Welcome';
import NotFound from './pages/NotFound';
import ApplicantDashboard from './pages/applicant/Dashboard';
import Documents from './pages/applicant/Documents';
import BrowseJobs from './pages/applicant/BrowseJobs';
import JobDetail from './pages/applicant/JobDetail';
import Apply from './pages/applicant/Apply';
import MyApplications from './pages/applicant/MyApplications';
import Feedback from './pages/applicant/Feedback';
import DocumentHistory from './pages/applicant/DocumentHistory';
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerApplications from './pages/employer/Applications';
import CandidateReview from './pages/employer/CandidateReview';
import OverallDecision from './pages/employer/OverallDecision';
import FeedbackSent from './pages/employer/FeedbackSent';
import ReviewHistory from './pages/employer/ReviewHistory';

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== role) return <Navigate to={currentUser.role === 'applicant' ? '/applicant' : '/employer'} replace />;
  return <>{children}</>;
}

/** Move focus to <main> and scroll to top on navigation (screen-reader friendly). */
function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <RouteFocus />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/applicant" element={<RequireRole role="applicant"><AppLayout role="applicant" /></RequireRole>}>
              <Route index element={<ApplicantDashboard />} />
              <Route path="documents" element={<Documents />} />
              <Route path="jobs" element={<BrowseJobs />} />
              <Route path="jobs/:jobId" element={<JobDetail />} />
              <Route path="jobs/:jobId/apply" element={<Apply />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="feedback/:appId" element={<Feedback />} />
              <Route path="history" element={<DocumentHistory />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/employer" element={<RequireRole role="employer"><AppLayout role="employer" /></RequireRole>}>
              <Route index element={<EmployerDashboard />} />
              <Route path="applications" element={<EmployerApplications />} />
              <Route path="review/:appId" element={<CandidateReview />} />
              <Route path="review/:appId/decision" element={<OverallDecision />} />
              <Route path="review/:appId/sent" element={<FeedbackSent />} />
              <Route path="history" element={<ReviewHistory />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
