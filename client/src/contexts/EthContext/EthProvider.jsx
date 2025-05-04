"use client"

import { useReducer, useCallback, useEffect, useState } from "react"
import Web3 from "web3"
import { reducer, actions, initialState } from "./state"
import EthContext from "./EthContext"

import SimpleStorageJSON from "../../contracts/SimpleStorage.json"
import UserManagementJSON from "../../contracts/UserManagement.json"
import MissingRegistryJSON from "../../contracts/MissingRegistry.json"
import AppointmentSystemJSON from "../../contracts/AppointmentSystem.json"

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const init = useCallback(async (artifact) => {
    if (artifact) {
      try {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545")
        const accounts = await web3.eth.requestAccounts()
        const networkID = await web3.eth.net.getId()

        // Load all contracts
        const simpleStorageContract = new web3.eth.Contract(
          SimpleStorageJSON.abi,
          SimpleStorageJSON.networks[networkID] && SimpleStorageJSON.networks[networkID].address,
        )

        const userManagementContract = new web3.eth.Contract(
          UserManagementJSON.abi,
          UserManagementJSON.networks[networkID] && UserManagementJSON.networks[networkID].address,
        )

        const missingRegistryContract = new web3.eth.Contract(
          MissingRegistryJSON.abi,
          MissingRegistryJSON.networks[networkID] && MissingRegistryJSON.networks[networkID].address,
        )

        const appointmentSystemContract = new web3.eth.Contract(
          AppointmentSystemJSON.abi,
          AppointmentSystemJSON.networks[networkID] && AppointmentSystemJSON.networks[networkID].address,
        )

        const contracts = {
          simpleStorage: simpleStorageContract,
          userManagement: userManagementContract,
          missingRegistry: missingRegistryContract,
          appointmentSystem: appointmentSystemContract,
        }

        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contracts },
        })

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(`Failed to load web3, accounts, or contract. Check console for details.`)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/SimpleStorage.json")
        init(artifact)
      } catch (err) {
        console.error(err)
        setError("Failed to load SimpleStorage contract artifact. Check console for details.")
        setLoading(false)
      }
    }

    tryInit()
  }, [init])

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"]
    const handleChange = () => {
      init(state.artifact)
    }

    events.forEach((e) => window.ethereum && window.ethereum.on(e, handleChange))
    return () => {
      events.forEach((e) => window.ethereum && window.ethereum.removeListener(e, handleChange))
    }
  }, [init, state.artifact])

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Loading blockchain data...</h2>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
            <p className="mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              Make sure you have MetaMask installed and connected to the correct network. If you're running locally,
              ensure your blockchain is running.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </EthContext.Provider>
  )
}

export default EthProvider
