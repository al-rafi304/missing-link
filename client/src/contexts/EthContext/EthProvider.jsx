import React, { useReducer, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import EthContext from './EthContext';
import { reducer, actions, initialState } from './state';

function EthProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const init = useCallback(async () => {
        try {
            const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
            const accounts = await web3.eth.requestAccounts();
            const networkID = await web3.eth.net.getId();

            const loadContract = async (name) => {
                const artifact = require(`../../contracts/${name}.json`);
                const { abi } = artifact;
                const address = artifact.networks[networkID]?.address;
                const instance = new web3.eth.Contract(abi, address);
                return { artifact, instance };
            };

            const [userManagement, missingRegistry, appointmentSystem, test] =
                await Promise.all([
                    loadContract('UserManagement'),
                    loadContract('MissingRegistry'),
                    loadContract('AppointmentSystem'),
                    loadContract('SimpleStorage'),
                ]);

            dispatch({
                type: actions.init,
                data: {
                    web3,
                    accounts,
                    networkID,
                    artifacts: {
                        userManagement: userManagement.artifact,
                        missingRegistry: missingRegistry.artifact,
                        appointmentSystem: appointmentSystem.artifact,
                        test: test.artifact,
                    },
                    contracts: {
                        userManagement: userManagement.instance,
                        missingRegistry: missingRegistry.instance,
                        appointmentSystem: appointmentSystem.instance,
                        test: test.instance,
                    },
                },
            });
        } catch (err) {
            console.error('Failed to init contracts:', err);
        }
    }, []);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        const events = ['chainChanged', 'accountsChanged'];
        const handleChange = () => init();

        events.forEach((e) => window.ethereum.on(e, handleChange));
        return () => {
            events.forEach((e) =>
                window.ethereum.removeListener(e, handleChange),
            );
        };
    }, [init]);

    return (
        <EthContext.Provider value={{ state, dispatch }}>
            {children}
        </EthContext.Provider>
    );
}

export default EthProvider;
