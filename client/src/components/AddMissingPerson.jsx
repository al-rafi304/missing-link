"use client"

import { useState, useContext, useEffect } from "react"
import EthContext from "../contexts/EthContext/EthContext"

const AddMissingPerson = () => {
  const { state } = useContext(EthContext)
  const { accounts, contracts } = state

  const [isReporter, setIsReporter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    description: "",
    lastSeen: "0", // Default to Dhaka
    relativeContact: "",
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

    checkUserRole()
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
      if (!contracts.missingRegistry || !accounts[0]) {
        throw new Error("Contract or account not loaded")
      }

      if (!isReporter) {
        throw new Error("Only reporters can add missing person records")
      }

      await contracts.missingRegistry.methods
        .addMissingPerson(
          formData.name,
          Number.parseInt(formData.age),
          Number.parseInt(formData.height),
          formData.description,
          Number.parseInt(formData.lastSeen),
          formData.relativeContact,
        )
        .send({ from: accounts[0] })

      setMessage({
        type: "success",
        content: "Missing person report submitted successfully!",
      })

      // Reset form
      setFormData({
        name: "",
        age: "",
        height: "",
        description: "",
        lastSeen: "0",
        relativeContact: "",
      })
    } catch (error) {
      console.error("Error adding missing person:", error)
      setMessage({
        type: "error",
        content: error.message.includes("revert")
          ? "Failed: " + error.message.split("revert")[1]
          : "Failed to add missing person. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReporter) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
          Only reporters can add missing person records. Please register as a reporter first.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Report Missing Person</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.content}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="height">
            Height (cm)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            min="50"
            max="250"
            value={formData.height}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastSeen">
            Last Seen (Division)
          </label>
          <select
            id="lastSeen"
            name="lastSeen"
            value={formData.lastSeen}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="0">Dhaka</option>
            <option value="1">Chittagong</option>
            <option value="2">Rajshahi</option>
            <option value="3">Khulna</option>
            <option value="4">Barisal</option>
            <option value="5">Sylhet</option>
            <option value="6">Rangpur</option>
            <option value="7">Mymensingh</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="relativeContact">
            Relative Contact
          </label>
          <input
            type="text"
            id="relativeContact"
            name="relativeContact"
            value={formData.relativeContact}
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
            {isLoading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMissingPerson
