import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

// Lazy load pages for production readiness and loading states
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const LiveMonitoring = React.lazy(() => import("./pages/LiveMonitoring"));
const Violations = React.lazy(() => import("./pages/Violations"));
const ChallanManagement = React.lazy(() => import("./pages/ChallanManagement"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Login = React.lazy(() => import("./pages/Login"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));

// Error Boundary class
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
            <p className="text-muted-foreground">Something went wrong.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Placeholder = ({ title }) => (
  <div className="flex p-8 items-center justify-center h-full">
    <h1 className="text-2xl font-semibold text-muted-foreground">{title} Construction</h1>
  </div>
);

const Loader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[400px]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
  </div>
);

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-monitoring" element={<LiveMonitoring />} />
                <Route path="/violations" element={<Violations />} />
                <Route path="/challan-management" element={<ChallanManagement />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
