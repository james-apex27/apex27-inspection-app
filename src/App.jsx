import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InspectionProvider } from './context/InspectionContext.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { PropertySearch } from './pages/PropertySearch.jsx';
import { InspectionDetails } from './pages/InspectionDetails.jsx';
import { RoomWalkthrough } from './pages/RoomWalkthrough.jsx';
import { UtilitiesForm } from './pages/UtilitiesForm.jsx';
import { MaintenanceIssues } from './pages/MaintenanceIssues.jsx';
import { ReviewSubmit } from './pages/ReviewSubmit.jsx';
import { Confirmation } from './pages/Confirmation.jsx';

function App() {
  return (
    <BrowserRouter>
      <InspectionProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<PropertySearch />} />
          <Route path="/inspection/details" element={<InspectionDetails />} />
          <Route path="/inspection/rooms" element={<RoomWalkthrough />} />
          <Route path="/inspection/utilities" element={<UtilitiesForm />} />
          <Route path="/inspection/issues" element={<MaintenanceIssues />} />
          <Route path="/inspection/review" element={<ReviewSubmit />} />
          <Route path="/inspection/complete" element={<Confirmation />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </InspectionProvider>
    </BrowserRouter>
  );
}

export default App;
