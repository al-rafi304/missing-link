"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import EthContext from "../contexts/EthContext/EthContext"

const MissingPersonDetails = () => {
  const { id } = useParams()
  const { state } = useContext(EthContext)
  const { contracts } = state

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [personDetails, setPersonDetails] = useState(null)
  const [investigatorDetails, setInvestigatorDetails] = useState(null)
  const [appointmentDetails, setAppointmentDetails] = useState(null)

  const divisionNames = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"]

  useEffect(() => {
    const fetchMissingPersonDetails = async () => {
      if (!contracts || !contracts.missingRegistry) {
        setError("Contracts not loaded. Please try again later.")
        setIsLoading(false)
        return
      }

      try {
        // Fetch missing person details
        const details = await contracts.missingRegistry.methods.getMissingPerson(id).call()
        setPersonDetails(details)

        // Check if investigator is assigned
        if (
          details.investigatorAddress &&
          details.investigatorAddress !== "0x0000000000000000000000000000000000000000"
        ) {
          try {
            // Fetch investigator details
            const investigator = await contracts.userManagement.methods
              .getUserDetails(details.investigatorAddress)
              .call()
            setInvestigatorDetails(investigator)

            // Fetch appointment details if available
            try {
              const appointments = await contracts.appointmentSystem.methods.getAppointmentsByCaseId(id).call()
              if (appointments && appointments.length > 0) {
                setAppointmentDetails(appointments[0]) // Get the first appointment for this case
              }
            } catch (error) {
              console.error("Error fetching appointment details:", error)
            }
          } catch (error) {
            console.error("Error fetching investigator details:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching missing person details:", error)
        setError("Failed to fetch missing person details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissingPersonDetails()
  }, [contracts, id])

  const getUrgencyLevel = (age) => {
    if (age < 18) return { level: "High", color: "red" }
    if (age > 50) return { level: "Medium", color: "yellow" }
    return { level: "Low", color: "blue" }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <div className="p-4 mb-4 rounded bg-red-100 text-red-700">{error}</div>
        <div className="text-center mt-4">
          <Link to="/search" className="text-blue-500 hover:underline">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  if (!personDetails) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <div className="p-4 mb-4 rounded bg-yellow-100 text-yellow-700">
          No details found for this missing person. The record may have been removed or the ID is invalid.
        </div>
        <div className="text-center mt-4">
          <Link to="/search" className="text-blue-500 hover:underline">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  const urgency = getUrgencyLevel(Number(personDetails.age))

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Missing Person Details</h2>
        <span
          className={`py-1 px-3 rounded-full text-xs ${
            personDetails.status === "0" ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"
          }`}
        >
          {personDetails.status === "0" ? "Missing" : "Found"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left column - Basic Information */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium text-lg">{personDetails.name}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Age</p>
                <p className="font-medium text-lg">{personDetails.age} years</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Height</p>
                <p className="font-medium">{personDetails.height} cm</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Last Seen (Division)</p>
                <p className="font-medium">{divisionNames[personDetails.lastSeen]}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">Description</p>
                <p className="font-medium">{personDetails.description}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">Relative Contact</p>
                <p className="font-medium">{personDetails.relativeContact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Status Information */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Case Status</h3>

            <div className="mb-4">
              <p className="text-gray-600 text-sm">Case ID</p>
              <p className="font-medium">{id}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm">Urgency Level</p>
              <div className="mt-1">
                <span className={`py-1 px-3 rounded-full text-xs bg-${urgency.color}-200 text-${urgency.color}-700`}>
                  {urgency.level}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {urgency.level === "High"
                    ? "Child under 18 years old"
                    : urgency.level === "Medium"
                      ? "Senior over 50 years old"
                      : "Adult between 18-50 years"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm">Report Date</p>
              <p className="font-medium">{formatTimestamp(personDetails.timestamp)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Investigation Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Assigned Investigator</h4>
            {personDetails.investigatorAddress &&
            personDetails.investigatorAddress !== "0x0000000000000000000000000000000000000000" ? (
              <div className="bg-white p-4 rounded border">
                <p>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium">{investigatorDetails?.name || "Name not available"}</span>
                </p>
                <p className="mt-1">
                  <span className="text-gray-600">Address: </span>
                  <span className="font-medium text-sm break-all">{personDetails.investigatorAddress}</span>
                </p>
                <p className="mt-1">
                  <span className="text-gray-600">NID: </span>
                  <span className="font-medium">{investigatorDetails?.nid || "NID not available"}</span>
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-yellow-700">No investigator assigned yet</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Appointment Details</h4>
            {appointmentDetails ? (
              <div className="bg-white p-4 rounded border">
                <p>
                  <span className="text-gray-600">Appointment ID: </span>
                  <span className="font-medium">{appointmentDetails.id}</span>
                </p>
                <p className="mt-1">
                  <span className="text-gray-600">Scheduled Time: </span>
                  <span className="font-medium">{formatTimestamp(appointmentDetails.timestamp)}</span>
                </p>
                <p className="mt-1">
                  <span className="text-gray-600">Reporter: </span>
                  <span className="font-medium text-sm break-all">{appointmentDetails.Reporter}</span>
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-yellow-700">No appointment scheduled yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Link
          to="/search"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back to Search
        </Link>

        {personDetails.status === "0" && (
          <Link
            to={`/book-appointment?caseId=${id}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Book Appointment
          </Link>
        )}
      </div>
    </div>
  )
}

export default MissingPersonDetails
