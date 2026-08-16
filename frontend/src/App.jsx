import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";
import CheckIn from "./pages/CheckIn";
import Housekeeping from "./pages/Housekeeping";
import FoodOrder from "./pages/FoodOrder";
import Checkout from "./pages/Checkout";
import RoomManagement from "./pages/RoomManagement";
import GuestManagement from "./pages/GuestManagement";
import BookingManagement from "./pages/BookingManagement";
import BillingManagement from "./pages/BillingManagement";
import Reports from "./pages/Reports";
import HotelProfile from "./pages/HotelProfile";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";


import RoomSettingsPage from "./pages/RoomSettingsPage";
import { isAuthenticated } from "./utils/auth";
import { HotelProfileProvider } from "./context/HotelProfileContext";

function FallbackRedirect() {
  return isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <HotelProfileProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Application Routes ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guests"
          element={
            <ProtectedRoute>
              <GuestManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <BookingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-ins"
          element={
            <ProtectedRoute>
              <CheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/housekeeping"
          element={
            <ProtectedRoute>
              <Housekeeping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-orders"
          element={
            <ProtectedRoute>
              <FoodOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel-profile"
          element={
            <ProtectedRoute>
              <HotelProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        {/* /change-password removed — password reset is now on the Login page */}

        <Route
          path="/room-settings"
          element={
            <ProtectedRoute>
              <RoomSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Dynamic Fallback Redirects ── */}
        <Route path="/" element={<FallbackRedirect />} />
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </HotelProfileProvider>
  );
}

export default App;
