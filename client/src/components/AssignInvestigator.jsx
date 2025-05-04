'use client';

import { useState, useContext, useEffect } from 'react';
import EthContext from '../contexts/EthContext/EthContext';

const AssignInvestigator = () => {
    const { state } = useContext(EthContext);
    const { accounts, contracts } = state;

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [caseId, setCaseId] = useState('');
    const [investigatorAddress, setInvestigatorAddress] = useState('');
    const [investigators, setInvestigators] = useState([]);
    const [caseDetails, setCaseDetails] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const checkUserRole = async () => {
            if (!contracts || !accounts) return;

            try {
                const isAdminResult = await contracts.userManagement.methods
                    .isAdmin(accounts[0])
                    .call();
                setIsAdmin(isAdminResult);
            } catch (error) {
                console.error('Error checking user role:', error);
            }
            try {
                const investigators = await contracts.userManagement.methods
                    .getInvestigators()
                    .call();
                setInvestigators(investigators);
            } catch {
                setInvestigators([
                    { address: '0x123...', name: 'Investigator 1' },
                    { address: '0x456...', name: 'Investigator 2' },
                    { address: '0x789...', name: 'Investigator 3' },
                ]);
            }
        };

        checkUserRole();
    }, [accounts, contracts]);

    const fetchCaseDetails = async () => {
        if (!caseId || !contracts.missingRegistry) return;

        setIsFetching(true);
        setCaseDetails(null);
        setMessage({ type: '', content: '' });

        try {
            const details = await contracts.missingRegistry.methods
                .getMissingPerson(caseId)
                .call();
            setCaseDetails(details);
        } catch (error) {
            console.error('Error fetching case details:', error);
            setMessage({
                type: 'error',
                content:
                    'Failed to fetch case details. Please check the case ID.',
            });
        } finally {
            setIsFetching(false);
        }
    };
    const mockFetchInvestigators = async () => {
        // For demo purposes, we'll just use some mock addresses
        try {
            const investigators = await contracts.userManagement.methods
                .getInvestigators()
                .call();
            setInvestigators(investigators);
        } catch {
            setInvestigators([
                { address: '0x123...', name: 'Investigator 1' },
                { address: '0x456...', name: 'Investigator 2' },
                { address: '0x789...', name: 'Investigator 3' },
            ]);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', content: '' });

        try {
            if (!contracts.missingRegistry || !accounts[0]) {
                throw new Error('Contract or account not loaded');
            }

            if (!isAdmin) {
                throw new Error('Only admins can assign investigators');
            }

            await contracts.missingRegistry.methods
                .assignInvestigator(caseId, investigatorAddress)
                .send({ from: accounts[0] });

            setMessage({
                type: 'success',
                content: 'Investigator assigned successfully!',
            });

            // Refresh case details
            await fetchCaseDetails();
        } catch (error) {
            console.error('Error assigning investigator:', error);
            setMessage({
                type: 'error',
                content: error.message.includes('revert')
                    ? 'Failed: ' + error.message.split('revert')[1]
                    : 'Failed to assign investigator. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
                <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
                    Only admins can assign investigators. Please login as an
                    admin.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Assign Investigator
            </h2>

            {message.content && (
                <div
                    className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                    {message.content}
                </div>
            )}

            <div className="mb-6">
                <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="caseId"
                >
                    Case ID
                </label>
                <div className="flex">
                    <input
                        type="number"
                        id="caseId"
                        value={caseId}
                        onChange={(e) => setCaseId(e.target.value)}
                        className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        min="1"
                        required
                    />
                    <button
                        type="button"
                        onClick={fetchCaseDetails}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                        disabled={isFetching || !caseId}
                    >
                        {isFetching ? 'Loading...' : 'Fetch'}
                    </button>
                </div>
            </div>

            {caseDetails && (
                <div className="mb-6">
                    <div className="p-4 border rounded mb-4">
                        <h3 className="font-bold text-lg mb-2">
                            {caseDetails.name}
                        </h3>
                        <p>
                            <strong>Age:</strong> {caseDetails.age}
                        </p>
                        <p>
                            <strong>Status:</strong>{' '}
                            {caseDetails.status === '0' ? 'Missing' : 'Found'}
                        </p>
                        <p>
                            <strong>Current Investigator:</strong>{' '}
                            {caseDetails.investigatorAddress ===
                            '0x0000000000000000000000000000000000000000'
                                ? 'None assigned'
                                : `${caseDetails.investigatorAddress.substring(0, 6)}...${caseDetails.investigatorAddress.substring(38)}`}
                        </p>
                    </div>

                    {caseDetails.status === '0' &&
                        caseDetails.investigatorAddress ===
                            '0x0000000000000000000000000000000000000000' && (
                            <form onSubmit={handleAssign}>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="investigatorAddress"
                                    >
                                        Investigator Address
                                    </label>
                                    {/* <input
                                        type="text"
                                        id="investigatorAddress"
                                        value={investigatorAddress}
                                        onChange={(e) =>
                                            setInvestigatorAddress(
                                                e.target.value,
                                            )
                                        }
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="0x..."
                                        required
                                    /> */}
                                    <select
                                        id="investigator"
                                        name="investigator"
                                        value={investigatorAddress}
                                        onChange={(e) =>
                                            setInvestigatorAddress(
                                                e.target.value,
                                            )
                                        }
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        <option value="">
                                            Select Investigator
                                        </option>
                                        {investigators.map((inv, index) => (
                                            <option
                                                key={index}
                                                value={inv.walletAddress}
                                            >
                                                {inv.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? 'Assigning...'
                                        : 'Assign Investigator'}
                                </button>
                            </form>
                        )}

                    {caseDetails.status === '1' && (
                        <div className="p-2 bg-yellow-100 text-yellow-700 rounded">
                            Cannot assign investigator to a found person.
                        </div>
                    )}

                    {caseDetails.status === '0' &&
                        caseDetails.investigatorAddress !==
                            '0x0000000000000000000000000000000000000000' && (
                            <div className="p-2 bg-yellow-100 text-yellow-700 rounded">
                                This case already has an assigned investigator.
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default AssignInvestigator;
