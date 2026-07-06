import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

// Lazy load pages for production readiness and loading states
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const LiveMonitoring = React.lazy(() => import("./pages/LiveMonitoring"));
const Violations = React.lazy(() => import("./pages/Violations"));
const ChallanManagement = React.lazy(() => import("./pages/ChallanManagement"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Login = React.lazy(() => import("./pages/Login"));

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
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-neutral-50">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-red-500">Oops!</h1>
            <p className="text-gray-400">Something went wrong.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 rounded-md bg-[#2A6B7C] px-4 py-2 text-sm font-medium hover:bg-[#1f505d] transition-colors"
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
    <h1 className="text-2xl font-semibold text-gray-300">{title} Construction</h1>
  </div>
);

const Loader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[400px]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2A6B7C] border-t-transparent"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
              <Route path="/violations" element={<Violations />} />
              <Route path="/challan-management" element={<ChallanManagement />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
