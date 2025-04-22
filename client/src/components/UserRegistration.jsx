"use client"

import { useState, useContext } from "react"
import EthContext from "../contexts/EthContext/EthContext"

const UserRegistration = () => {
  const { state } = useContext(EthContext)
  const { accounts, contracts } = state

  const [formData, setFormData] = useState({
    nid: "",
    name: "",
    role: "1", // Default to Reporter
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })

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
      if (!contracts.userManagement || !accounts[0]) {
        throw new Error("Contract or account not loaded")
      }

      await contracts.userManagement.methods
        .registerUser(formData.nid, formData.name, Number.parseInt(formData.role))
        .send({ from: accounts[0] })

      setMessage({
        type: "success",
        content:
          "Registration successful! You are now registered as a " +
          (formData.role === "0" ? "Admin" : formData.role === "1" ? "Reporter" : "Investigator"),
      })

      // Reset form
      setFormData({
        nid: "",
        name: "",
        role: "1",
      })
    } catch (error) {
      console.error("Registration error:", error)
      setMessage({
        type: "error",
        content: error.message.includes("revert")
          ? "Registration failed: " + error.message.split("revert")[1]
          : "Registration failed. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">User Registration</h2>

      {message.content && (
        <div
          className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.content}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nid">
            National ID
          </label>
          <input
            type="text"
            id="nid"
            name="nid"
            value={formData.nid}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

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

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="1">Reporter</option>
            <option value="2">Investigator</option>
            <option value="0">Admin</option>
          </select>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserRegistration
