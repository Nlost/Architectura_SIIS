import { Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";

import Medic from "./pages/medic/medic";
import PacientiMedic from "./pages/medic/pacienti";
import ConsultatiiMedic from "./pages/medic/consultatii";
import MonitorizareMedic from "./pages/medic/monitorizare";
import AlerteMedic from "./pages/medic/alerte";
import RapoarteMedic from "./pages/medic/rapoarte";
import FisaPacient from "./pages/medic/fisapacient";
import Hl7Export from "./pages/medic/hl7export";

import Admin from "./pages/admin/admin";
import AdminUtilizatori from "./pages/admin/adminutilizatori";
import AdminRoluri from "./pages/admin/adminroluri";
import AdminAudit from "./pages/admin/adminaudit";
import AdminStatus from "./pages/admin/adminstatus";
import AdminHl7 from "./pages/admin/adminhl7";
import AdminCsv from "./pages/admin/admincsv";

import Pacient from "./pages/pacient/pacient";
import PacientFisa from "./pages/pacient/pacientfisa";
import PacientValori from "./pages/pacient/pacientvalori";
import PacientRecomandari from "./pages/pacient/pacientrecomandari";
import PacientAlerte from "./pages/pacient/pacientalerte";

import ProtectedRoute from "./ProtectedRoute";

const DoctorRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
    {children}
  </ProtectedRoute>
);

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["ADMIN"]}>
    {children}
  </ProtectedRoute>
);

const PatientRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["PATIENT"]}>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/medic" element={<DoctorRoute><Medic /></DoctorRoute>} />
      <Route path="/medic/pacienti" element={<DoctorRoute><PacientiMedic /></DoctorRoute>} />
      <Route path="/medic/consultatii" element={<DoctorRoute><ConsultatiiMedic /></DoctorRoute>} />
      <Route path="/medic/monitorizare" element={<DoctorRoute><MonitorizareMedic /></DoctorRoute>} />
      <Route path="/medic/alerte" element={<DoctorRoute><AlerteMedic /></DoctorRoute>} />
      <Route path="/medic/rapoarte" element={<DoctorRoute><RapoarteMedic /></DoctorRoute>} />
      <Route path="/medic/pacient/:id" element={<DoctorRoute><FisaPacient /></DoctorRoute>} />
      <Route path="/medic/hl7" element={<DoctorRoute><Hl7Export /></DoctorRoute>} />

      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/admin/adminutilizatori" element={<AdminRoute><AdminUtilizatori /></AdminRoute>} />
      <Route path="/admin/adminroluri" element={<AdminRoute><AdminRoluri /></AdminRoute>} />
      <Route path="/admin/adminaudit" element={<AdminRoute><AdminAudit /></AdminRoute>} />
      <Route path="/admin/adminstatus" element={<AdminRoute><AdminStatus /></AdminRoute>} />
      <Route path="/admin/adminhl7" element={<AdminRoute><AdminHl7 /></AdminRoute>} />
      <Route path="/admin/admincsv" element={<AdminRoute><AdminCsv /></AdminRoute>} />

      <Route path="/pacient" element={<PatientRoute><Pacient /></PatientRoute>} />
      <Route path="/pacient/pacientfisa" element={<PatientRoute><PacientFisa /></PatientRoute>} />
      <Route path="/pacient/pacientvalori" element={<PatientRoute><PacientValori /></PatientRoute>} />
      <Route path="/pacient/pacientrecomandari" element={<PatientRoute><PacientRecomandari /></PatientRoute>} />
      <Route path="/pacient/pacientalerte" element={<PatientRoute><PacientAlerte /></PatientRoute>} />
    </Routes>
  );
}

export default App;