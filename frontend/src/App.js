import Login from "./components/Login/Login";
import Registration from "./components/Registration/Registration";
import CreateRound from "./components/CreateRound";
import CreateDrive from "./components/CreateDrive";
import Dashboard from "./components/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";

import "./App.css";

import WorkflowList from "./workflow/components/workflow_list";
import WorkflowListExecutions from "./workflow/components/WorkflowListExecutions";
import ShowForm from "./workflow/components/workflow_form";

import AppContent from "./components/AppContent";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/workflow" element={<WorkflowList />} />

      <Route
        path="/workflow/workflow_list_executions"
        element={<WorkflowListExecutions />}
      />
      <Route
        path="/workflow/workflow_form/:execution_id"
        element={<ShowForm />}
      />

      {/* <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} /> */}

      <Route path="/" element={<Home />}>
        <Route path="/registration" element={<Registration />} />
        <Route index element={<Login />} />
      </Route>
      <Route path="/admin/*" element={<AppContent />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/createdrive"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateDrive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/createround"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateRound />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
