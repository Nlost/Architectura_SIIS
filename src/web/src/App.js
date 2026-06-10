import { Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Medic from "./pages/medic/medic";
import Admin from "./pages/admin/admin";
import Pacient from "./pages/pacient/pacient";
import PacientiMedic from "./pages/medic/pacienti";
import ConsultatiiMedic from "./pages/medic/consultatii";
import MonitorizareMedic from "./pages/medic/monitorizare";
import AlerteMedic from "./pages/medic/alerte";
import RapoarteMedic from "./pages/medic/rapoarte";
import Hl7Export from "./pages/medic/hl7export";
import FisaPacient from "./pages/medic/fisapacient";
import PacientFisa from "./pages/pacient/pacientfisa";
import PacientValori from "./pages/pacient/pacientvalori";
import PacientRecomandari from "./pages/pacient/pacientrecomandari";
import PacientAlerte from "./pages/pacient/pacientalerte";
import AdminUtilizatori from "./pages/admin/adminutilizatori";
import AdminRoluri from "./pages/admin/adminroluri";
import AdminAudit from "./pages/admin/adminaudit";
import AdminStatus from "./pages/admin/adminstatus";
import AdminHl7 from "./pages/admin/adminhl7";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/medic" element={<Medic />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/pacient" element={<Pacient />} />
      <Route path="/medic/pacienti" element={<PacientiMedic />} />
      <Route path="/medic/consultatii" element={<ConsultatiiMedic />} />
      <Route path="/medic/monitorizare" element={<MonitorizareMedic />} />
      <Route path="/medic/alerte" element={<AlerteMedic />} />
      <Route path="/medic/rapoarte" element={<RapoarteMedic />} />
      <Route path="/medic/hl7" element={<Hl7Export />} />
      <Route path="/medic/pacient/:id" element={<FisaPacient />} />
      <Route path="/pacient/pacientfisa" element={<PacientFisa />} />
      <Route path="/pacient/pacientvalori" element={<PacientValori />} />
      <Route path="/pacient/pacientrecomandari" element={<PacientRecomandari />} />
      <Route path="/pacient/pacientalerte" element={<PacientAlerte />} />
      <Route path="/admin/adminutilizatori" element={<AdminUtilizatori />} />
      <Route path="/admin/adminroluri" element={<AdminRoluri />} />
      <Route path="/admin/adminaudit" element={<AdminAudit />} />
      <Route path="/admin/adminstatus" element={<AdminStatus />} />
      <Route path="/admin/adminhl7" element={<AdminHl7 />} />
    </Routes>
  );
}

export default App;