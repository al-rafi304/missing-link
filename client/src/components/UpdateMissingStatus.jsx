"use client"

import { useState, useContext, useEffect } from "react"
import EthContext from "../contexts/EthContext/EthContext"

const UpdateMissingStatus = () => {
  const { state } = useContext(EthContext)
  const { accounts, contracts } = state

  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [caseId, setCaseId] = useState("")
  const [caseDetails, setCaseDetails] = useState(null)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      if (!contracts || !accounts) return

      try {
        const isAdminResult = await contracts.userManagement.methods.isAdmin(accounts[0]).call()
        setIsAdmin(isAdminResult)
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }

    checkUserRole()
  }, [accounts, contracts])

  const fetchCaseDetails = async () => {
    if (!caseId || !contracts.missingRegistry) return

    setIsFetching(true)
    setCaseDetails(null)
    setMessage({ type: "", content: "" })

    try {
      const details = await contracts.missingRegistry.methods.getMissingPerson(caseId).call()
      setCaseDetails(details)
    } catch (error) {
      console.error("Error fetching case details:", error)
      setMessage({
        type: "error",
        content: "Failed to fetch case details. Please check the case ID.",
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleUpdateStatus = async () => {
    setIsLoading(true)
    setMessage({ type: "", content: "" })

    try {
      if (!contracts.missingRegistry || !accounts[0]) {
        throw new Error("Contract or account not loaded")
      }

      if (!isAdmin) {
        throw new Error("Only admins can update missing person status")
      }

      await contracts.missingRegistry.methods
        .updateStatus(caseId, 1) // 1 = Status.Found
        .send({ from: accounts[0] })

      setMessage({
        type: "success",
        content: "Status updated successfully! Person marked as found.",
      })

      // Refresh case details
      await fetchCaseDetails()
    } catch (error) {
      console.error("Error updating status:", error)
      setMessage({
        type: "error",
        content: error.message.includes("revert")
          ? "Failed: " + error.message.split("revert")[1]
          : "Failed to update status. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
          Only admins can update missing person status. Please login as an admin.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Missing Person Status</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.content}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caseId">
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
            {isFetching ? "Loading..." : "Fetch"}
          </button>
        </div>
      </div>

      {caseDetails && (
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-bold text-lg mb-2">{caseDetails.name}</h3>
          <p>
            <strong>Age:</strong> {caseDetails.age}
          </p>
          <p>
            <strong>Status:</strong> {caseDetails.status === "0" ? "Missing" : "Found"}
          </p>
          <p>
            <strong>Urgency:</strong>{" "}
            {caseDetails.urgency === "0" ? "Low" : caseDetails.urgency === "1" ? "Medium" : "High"}
          </p>

          {caseDetails.status === "0" && (
            <button
              type="button"
              onClick={handleUpdateStatus}
              className={`mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Mark as Found"}
            </button>
          )}

          {caseDetails.status === "1" && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              This person has already been marked as found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateMissingStatus
