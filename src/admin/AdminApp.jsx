import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";

const AdminPosts = lazy(() => import("./AdminPosts"));
const AdminEditor = lazy(() => import("./AdminEditor"));
const Dashboard = lazy(() => import("./crm/Dashboard"));
const EnquiriesList = lazy(() => import("./crm/EnquiriesList"));
const EnquiryNew = lazy(() => import("./crm/EnquiryNew"));
const EnquiryDetail = lazy(() => import("./crm/EnquiryDetail"));
const CustomersList = lazy(() => import("./crm/CustomersList"));
const CustomerDetail = lazy(() => import("./crm/CustomerDetail"));
const VendorsList = lazy(() => import("./crm/VendorsList"));
const VendorDetail = lazy(() => import("./crm/VendorDetail"));
const ImportWizard = lazy(() => import("./crm/ImportWizard"));
const QuoteEditor = lazy(() => import("./crm/QuoteEditor"));
const Settings = lazy(() => import("./crm/Settings"));

function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <PageLoader label="Checking your session" className="min-h-screen" />;
  if (status !== "authed") return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

const page = (element) => <Suspense fallback={<PageLoader className="py-24" />}>{element}</Suspense>;

/** Remounts detail pages when the id changes so their form state starts fresh. */
function Keyed({ component: Component, ...props }) {
  const { id } = useParams();
  return <Component key={id} {...props} />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Seo title="Admin | GreatVoyagers" noindex />
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={page(<Dashboard />)} />
          <Route path="enquiries" element={page(<EnquiriesList />)} />
          <Route path="enquiries/new" element={page(<EnquiryNew />)} />
          <Route path="enquiries/:id" element={page(<Keyed component={EnquiryDetail} />)} />
          <Route path="customers" element={page(<CustomersList />)} />
          <Route path="customers/import" element={page(<ImportWizard kind="customers" />)} />
          <Route path="customers/:id" element={page(<Keyed component={CustomerDetail} />)} />
          <Route path="vendors" element={page(<VendorsList />)} />
          <Route path="vendors/import" element={page(<ImportWizard kind="vendors" />)} />
          <Route path="vendors/:id" element={page(<Keyed component={VendorDetail} />)} />
          <Route path="quotes/:id" element={page(<Keyed component={QuoteEditor} />)} />
          <Route path="settings" element={page(<Settings />)} />
          <Route path="posts" element={page(<AdminPosts />)} />
          <Route path="posts/:id" element={page(<AdminEditor />)} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
