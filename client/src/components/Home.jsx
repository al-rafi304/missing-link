import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEth from '../contexts/EthContext/useEth';

const Home = () => {
    // const { state } = useContext(EthContext);
    // const { accounts, contracts } = state;
    const {
        state: { contracts, accounts },
    } = useEth();
    const [userRole, setUserRole] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [missingCount, setMissingCount] = useState(0);

    useEffect(() => {
        const checkUserRole = async () => {
            if (!contracts || !accounts) return;

            try {
                // Check if user is registered
                try {
                    const userDetails = await contracts.userManagement.methods
                        .getUserDetails(accounts[0])
                        .call();
                    setIsRegistered(true);
                    setUserRole(Number.parseInt(userDetails.role));
                } catch (error) {
                    // User not registered
                    setIsRegistered(false);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        };

        const fetchMissingCount = async () => {
            if (!contracts.missingRegistry) return;

            try {
                const count = await contracts.missingRegistry.methods
                    .caseCounter()
                    .call();
                setMissingCount(Number.parseInt(count) - 1); // Subtract 1 because counter starts at 1
            } catch (error) {
                console.error('Error fetching missing count:', error);
            }
        };

        checkUserRole();
        fetchMissingCount();
    }, [accounts, contracts]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Missing Persons Management System
                </h1>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg">
                        <span className="font-bold text-blue-700">
                            Total Missing Persons:
                        </span>{' '}
                        {missingCount}
                    </p>
                </div>

                {!isRegistered ? (
                    <div className="text-center">
                        <p className="mb-4">
                            Welcome to the Missing Persons Management System.
                            Please register to continue.
                        </p>
                        <Link
                            to="/register"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Register Now
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p className="mb-4">
                            Welcome back! You are logged in as a{' '}
                            <span className="font-semibold">
                                {userRole === 0
                                    ? 'Admin'
                                    : userRole === 1
                                      ? 'Reporter'
                                      : 'Investigator'}
                            </span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <Link
                                to="/search"
                                className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg text-center"
                            >
                                <h3 className="font-bold text-lg mb-2">
                                    Search Missing Persons
                                </h3>
                                <p className="text-sm">
                                    Search for missing persons by ID or division
                                </p>
                            </Link>

                            <Link
                                to="/appointments"
                                className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg text-center"
                            >
                                <h3 className="font-bold text-lg mb-2">
                                    View Appointments
                                </h3>
                                <p className="text-sm">
                                    View appointment schedules for investigators
                                </p>
                            </Link>

                            {userRole === 1 && ( // Reporter
                                <>
                                    <Link
                                        to="/add-missing"
                                        className="bg-green-100 hover:bg-green-200 p-4 rounded-lg text-center"
                                    >
                                        <h3 className="font-bold text-lg mb-2">
                                            Report Missing Person
                                        </h3>
                                        <p className="text-sm">
                                            Add a new missing person report
                                        </p>
                                    </Link>

                                    <Link
                                        to="/book-appointment"
                                        className="bg-green-100 hover:bg-green-200 p-4 rounded-lg text-center"
                                    >
                                        <h3 className="font-bold text-lg mb-2">
                                            Book Appointment
                                        </h3>
                                        <p className="text-sm">
                                            Book an appointment with an
                                            investigator
                                        </p>
                                    </Link>
                                </>
                            )}

                            {userRole === 0 && ( // Admin
                                <>
                                    <Link
                                        to="/update-status"
                                        className="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg text-center"
                                    >
                                        <h3 className="font-bold text-lg mb-2">
                                            Update Status
                                        </h3>
                                        <p className="text-sm">
                                            Update the status of missing persons
                                        </p>
                                    </Link>

                                    <Link
                                        to="/assign-investigator"
                                        className="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg text-center"
                                    >
                                        <h3 className="font-bold text-lg mb-2">
                                            Assign Investigator
                                        </h3>
                                        <p className="text-sm">
                                            Assign investigators to missing
                                            person cases
                                        </p>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
