"use client"

import { useState, useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import EthContext from "../contexts/EthContext/EthContext"

const BookAppointment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const caseIdFromUrl = queryParams.get("caseId")

  const { state } = useContext(EthContext)
  const { accounts, contracts } = state

  const [isReporter, setIsReporter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [investigators, setInvestigators] = useState([])
  const [caseDetails, setCaseDetails] = useState(null)

  const [formData, setFormData] = useState({
    caseId: caseIdFromUrl || "",
    investigatorAddress: "",
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

    const fetchInvestigators = async () => {
      if (!contracts || !contracts.userManagement) return

      try {
        const investigators = await contracts.userManagement.methods.getInvestigators().call()
        setInvestigators(investigators)
      } catch (error) {
        console.error("Error fetching investigators:", error)
        // Fallback to mock data if needed
        setInvestigators([
          { walletAddress: "0x123...", name: "Investigator 1" },
          { walletAddress: "0x456...", name: "Investigator 2" },
          { walletAddress: "0x789...", name: "Investigator 3" },
        ])
      }
    }

    const fetchCaseDetails = async () => {
      if (!caseIdFromUrl || !contracts || !contracts.missingRegistry) return

      try {
        const details = await contracts.missingRegistry.methods.getMissingPerson(caseIdFromUrl).call()
        setCaseDetails(details)
      } catch (error) {
        console.error("Error fetching case details:", error)
      }
    }

    checkUserRole()
    fetchInvestigators()
    fetchCaseDetails()
  }, [accounts, contracts, caseIdFromUrl])

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

      await contracts.appointmentSystem.methods
        .bookAppointment(formData.caseId, formData.investigatorAddress)
        .send({ from: accounts[0] })

      setMessage({
        type: "success",
        content: "Appointment booked successfully!",
      })

      // Reset form
      setFormData({
        caseId: "",
        investigatorAddress: "",
      })

      // Navigate to the details page after successful booking
      navigate(`/missing/${formData.caseId}`)
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
      <h2 className="text-2xl font-bold mb-6 text-center">Book Appointment</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.content}
        </div>
      )}

      {caseDetails && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Case Information</h3>
          <p>
            <span className="font-medium">Name:</span> {caseDetails.name}
          </p>
          <p>
            <span className="font-medium">Age:</span> {caseDetails.age}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className={caseDetails.status === "0" ? "text-red-600" : "text-green-600"}>
              {caseDetails.status === "0" ? "Missing" : "Found"}
            </span>
          </p>
        </div>
      )}

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
            readOnly={!!caseIdFromUrl}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="investigatorAddress">
            Select Investigator
          </label>
          <select
            id="investigatorAddress"
            name="investigatorAddress"
            value={formData.investigatorAddress}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select an investigator</option>
            {investigators.map((investigator, index) => (
              <option key={index} value={investigator.walletAddress}>
                {investigator.name}
              </option>
            ))}
          </select>
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
