import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterCandidatePage } from "./pages/RegisterCandidatePage";
import { RegisterEmployerPage } from "./pages/RegisterEmployerPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CandidatePortfolioEditorPage } from "./pages/CandidatePortfolioEditorPage";
import { PublicPortfolioPage } from "./pages/PublicPortfolioPage";
import { JobExplorePage } from "./pages/JobExplorePage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { CandidateApplicationsPage } from "./pages/CandidateApplicationsPage";
import { EmployerJobsPage } from "./pages/EmployerJobsPage";
import { EmployerJobEditorPage } from "./pages/EmployerJobEditorPage";
import { EmployerApplicationReviewPage } from "./pages/EmployerApplicationReviewPage";
import { HealthCheckPage } from "./pages/HealthCheckPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register/candidate" element={<RegisterCandidatePage />} />
              <Route path="register/employer" element={<RegisterEmployerPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile/edit"
                element={
                  <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                    <CandidatePortfolioEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route path="portfolio/:candidateId" element={<PublicPortfolioPage />} />
              
              {/* Job Discovery & Applications */}
              <Route path="jobs" element={<JobExplorePage />} />
              <Route path="jobs/:jobId" element={<JobDetailPage />} />
              <Route
                path="applications"
                element={
                  <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                    <CandidateApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Employer Job & Application Management */}
              <Route
                path="workspace/jobs"
                element={
                  <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                    <EmployerJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="workspace/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                    <EmployerJobEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="workspace/jobs/:jobId/edit"
                element={
                  <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                    <EmployerJobEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="workspace/applications/:appId"
                element={
                  <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                    <EmployerApplicationReviewPage />
                  </ProtectedRoute>
                }
              />

              <Route path="status" element={<HealthCheckPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
