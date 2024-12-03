import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Index = lazy(() => import("@/pages/Index"));
const Submit = lazy(() => import("@/pages/Submit"));
const Blog = lazy(() => import("@/pages/Blog"));
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const CheckStatus = lazy(() => import("@/pages/CheckStatus"));

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <Index />
        </Suspense>
      } />
      
      <Route path="/submit" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <Submit />
        </Suspense>
      } />
      
      <Route path="/blog" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <Blog />
        </Suspense>
      } />
      
      <Route path="/admin" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          {isAuthenticated ? <Admin /> : <Navigate to="/login" replace />}
        </Suspense>
      } />
      
      <Route path="/login" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          {isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
        </Suspense>
      } />
      
      <Route path="/check-status" element={
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <CheckStatus />
        </Suspense>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};