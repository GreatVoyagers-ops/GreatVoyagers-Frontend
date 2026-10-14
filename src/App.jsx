import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import RouterEffects from "./components/RouterEffects";
import SiteLayout from "./layouts/SiteLayout";
import Home from "./pages/Home";

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const QuoteView = lazy(() => import("./pages/QuoteView"));

export default function App() {
  return (
    <>
      <RouterEffects />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="q/:token" element={<QuoteView />} />
        <Route path="admin/*" element={<AdminApp />} />
      </Routes>
    </>
  );
}
