"use client"

import { useState, useContext, useEffect } from "react"
import EthContext from "../contexts/EthContext/EthContext"

const BookAppointment = () => {
  const { state } = useContext(EthContext)
  const { accounts, contracts, web3 } = state

  const [isReporter, setIsReporter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [investigators, setInvestigators] = useState([])
  const [admins, setAdmins] = useState([])
  const [appointmentFee, setAppointmentFee] = useState("0")

  const [formData, setFormData] = useState({
    caseId: "",
    investigator: "",
    admin: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    const checkUserRole = async () => {
      if (!contracts || !accounts) return

      try {
        const isReporterResult = await contracts.userManagement.methods.isReporter(accounts[0]).call()
        setIsReporter(isReporterResult)
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }

    const fetchAppointmentFee = async () => {
      if (!contracts.appointmentSystem) return

      try {
        const fee = await contracts.appointmentSystem.methods.appointmentFee().call()
        setAppointmentFee(fee)
      } catch (error) {
        console.error("Error fetching appointment fee:", error)
      }
    }

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

    // Similarly, this is a mock function for admins
    const mockFetchAdmins = async () => {
      try {
        const owner = await contracts.userManagement.methods.owner().call()
        setAdmins([{ address: owner, name: "System Admin" }])
      } catch (error) {
        console.error("Error fetching admin:", error)
        setAdmins([{ address: "0xabc...", name: "Admin 1" }])
      }
    }

    checkUserRole()
    fetchAppointmentFee()
    mockFetchInvestigators()
    mockFetchAdmins()
  }, [accounts, contracts])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", content: "" })

    try {
      if (!contracts.appointmentSystem || !accounts[0]) {
        throw new Error("Contract or account not loaded")
      }

      if (!isReporter) {
        throw new Error("Only reporters can book appointments")
      }

      // Convert date and time to timestamp
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      const timestamp = Math.floor(dateTime.getTime() / 1000)

      await contracts.appointmentSystem.methods
        .bookAppointment(formData.caseId, formData.investigator, timestamp)
        .send({
          from: accounts[0],
          value: appointmentFee,
        })

      setMessage({
        type: "success",
        content: "Appointment booked successfully!",
      })

      // Reset form
      setFormData({
        caseId: "",
        investigator: "",
        admin: "",
        date: "",
        time: "",
      })
    } catch (error) {
      console.error("Error booking appointment:", error)
      setMessage({
        type: "error",
        content: error.message.includes("revert")
          ? "Failed: " + error.message.split("revert")[1]
          : "Failed to book appointment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReporter) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
          Only reporters can book appointments. Please register as a reporter first.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Book an Appointment</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.content}
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-blue-700">
          <strong>Appointment Fee:</strong> {web3 ? web3.utils.fromWei(appointmentFee, "ether") : "0"} ETH
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caseId">
            Case ID
          </label>
          <input
            type="number"
            id="caseId"
            name="caseId"
            value={formData.caseId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="investigator">
            Investigator
          </label>
          <select
            id="investigator"
            name="investigator"
            value={formData.investigator}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Investigator</option>
            {investigators.map((inv, index) => (
              <option key={index} value={inv.walletAddress}>
                {inv.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin">
            Admin (Payment Recipient)
          </label>
          <select
            id="admin"
            name="admin"
            value={formData.admin}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Admin</option>
            {admins.map((admin, index) => (
              <option key={index} value={admin.address}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
            Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookAppointment
