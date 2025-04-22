"use client"

import { useState, useContext, useEffect } from "react"
import EthContext from "../contexts/EthContext/EthContext"

const ViewAppointments = () => {
  const { state } = useContext(EthContext)
  const { accounts, contracts } = state

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [investigators, setInvestigators] = useState([])
  const [selectedInvestigator, setSelectedInvestigator] = useState("")
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    // This is a mock function since we don't have a way to list all investigators
    // In a real app, you would need to implement a way to list all investigators
    const mockFetchInvestigators = async () => {
        // For demo purposes, we'll just use some mock addresses
        try {
          const investigators = await contracts.userManagement.methods.getInvestigators().call()
          setInvestigators(investigators)
        } catch {
            setInvestigators([
                { address: "0x123...", name: "Investigator 1" },
                { address: "0x456...", name: "Investigator 2" },
                { address: "0x789...", name: "Investigator 3" },
            ])
        }
      }

    mockFetchInvestigators()
  }, [])

  const fetchAppointments = async () => {
    if (!selectedInvestigator || !contracts.appointmentSystem) return

    setIsLoading(true)
    setAppointments([])
    setMessage({ type: "", content: "" })

    try {
      const appointmentList = await contracts.appointmentSystem.methods.getAppointments(selectedInvestigator).call()

      setAppointments(appointmentList)

      if (appointmentList.length === 0) {
        setMessage({
          type: "info",
          content: "No appointments found for this investigator.",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setMessage({
        type: "error",
        content: "Failed to fetch appointments. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">View Appointment Schedule</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : message.type === "info"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="investigator">
          Select Investigator
        </label>
        <div className="flex">
          <select
            id="investigator"
            value={selectedInvestigator}
            onChange={(e) => setSelectedInvestigator(e.target.value)}
            className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Investigator</option>
            {investigators.map((inv, index) => (
              <option key={index} value={inv.walletAddress}>
                {inv.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchAppointments}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            disabled={isLoading || !selectedInvestigator}
          >
            {isLoading ? "Loading..." : "View Schedule"}
          </button>
        </div>
      </div>

      {appointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Appointments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">Case ID</th>
                  <th className="py-3 px-6 text-left">Reporter</th>
                  <th className="py-3 px-6 text-left">Date & Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{appointment.id}</td>
                    <td className="py-3 px-6 text-left">{appointment.caseId}</td>
                    <td className="py-3 px-6 text-left">
                      {`${appointment.Reporter.substring(0, 6)}...${appointment.Reporter.substring(38)}`}
                    </td>
                    <td className="py-3 px-6 text-left">{formatTimestamp(appointment.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewAppointments
