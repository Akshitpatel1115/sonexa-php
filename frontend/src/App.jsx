import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ArtistRoute from './routes/ArtistRoute';
import PublicRoute from './routes/PublicRoute';
import AdminRoute from './routes/AdminRoute';
import Loader from "./components/common/Loader";
import PageSkeleton from "./components/common/PageSkeleton";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Albums = lazy(() => import("./pages/Albums"));
const AlbumDetails = lazy(() => import("./pages/AlbumDetails"));
const CreateAlbum = lazy(() => import("./pages/CreateAlbum"));
const EditAlbum = lazy(() => import("./pages/EditAlbum"));
const CreateMusic = lazy(() => import("./pages/CreateMusic"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminArtists = lazy(() => import("./pages/admin/AdminArtists"));
const AdminMusic = lazy(() => import("./pages/admin/AdminMusic"));
const AdminAlbums = lazy(() => import("./pages/admin/AdminAlbums"));

const App = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public Routes (Only accessible when logged out) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<Layout />}>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/album" element={<Albums />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Artist Routes */}
          <Route element={<ArtistRoute />}>
            <Route path="/create-album" element={<CreateAlbum />} />
            <Route path="/album/edit/:id" element={<EditAlbum />} />
            <Route path="/createMusic" element={<CreateMusic />} />
          </Route>
        </Route>

        {/* Isolated Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/artists" element={<AdminArtists />} />
            <Route path="/admin/music" element={<AdminMusic />} />
            <Route path="/admin/albums" element={<AdminAlbums />} />
          </Route>
        </Route>

        {/* Catch-all 404 Route (Outside of Layout so no sidebar/navbar) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
