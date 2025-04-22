import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EthProvider } from './contexts/EthContext';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import AddMissingPerson from './components/AddMissingPerson';
import UpdateMissingStatus from './components/UpdateMissingStatus';
import AssignInvestigator from './components/AssignInvestigator';
import SearchMissingPerson from './components/SearchMissingPerson';
import BookAppointment from './components/BookAppointment';
import ViewAppointments from './components/ViewAppointments';
import Home from './components/Home';

function App() {
    return (
        <EthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100">
                    {/* <Navbar /> */}
                    <div className="container mx-auto py-8 px-4">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/register"
                                element={<UserRegistration />}
                            />
                            <Route
                                path="/add-missing"
                                element={<AddMissingPerson />}
                            />
                            <Route
                                path="/update-status"
                                element={<UpdateMissingStatus />}
                            />
                            <Route
                                path="/assign-investigator"
                                element={<AssignInvestigator />}
                            />
                            <Route
                                path="/search"
                                element={<SearchMissingPerson />}
                            />
                            <Route
                                path="/book-appointment"
                                element={<BookAppointment />}
                            />
                            <Route
                                path="/appointments"
                                element={<ViewAppointments />}
                            />
                        </Routes>
                    </div>
                </div>
            </Router>
        </EthProvider>
    );
}

export default App;
