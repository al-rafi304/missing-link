"use client"

import { useState, useContext, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import EthContext from "../contexts/EthContext/EthContext"

const SearchMissingPerson = () => {
  const { state } = useContext(EthContext)
  const { contracts } = state

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [searchType, setSearchType] = useState("id")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [divisionStats, setDivisionStats] = useState([])

  const divisionNames = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"]

  const fetchDivisionStats = useCallback(async () => {
    if (!contracts || !contracts.missingRegistry) return

    try {
      const [divisions, counts] = await contracts.missingRegistry.methods.getSortedDivision(false).call()

      const stats = divisions.map((div, index) => ({
        division: divisionNames[Number.parseInt(div)],
        count: Number.parseInt(counts[index]),
      }))

      setDivisionStats(stats)
    } catch (error) {
      console.error("Error fetching division stats:", error)
    }
  }, [contracts])

  useEffect(() => {
    fetchDivisionStats()
  }, [contracts, fetchDivisionStats])

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setSearchResults([])
    setMessage({ type: "", content: "" })

    try {
      if (!contracts.missingRegistry) {
        throw new Error("Contract not loaded")
      }

      if (searchType === "id") {
        // Search by ID
        const result = await contracts.missingRegistry.methods.getMissingPerson(searchValue).call()
        setSearchResults([
          {
            id: searchValue,
            ...result,
          },
        ])
      } else if (searchType === "division") {
        // Search by division
        const divisionIndex = divisionNames.findIndex((div) => div.toLowerCase() === searchValue.toLowerCase())

        if (divisionIndex === -1) {
          throw new Error("Invalid division name")
        }

        const caseIds = await contracts.missingRegistry.methods.filterByDivision(divisionIndex).call()

        const results = await Promise.all(
          caseIds.map(async (id) => {
            const details = await contracts.missingRegistry.methods.getMissingPerson(id).call()
            return {
              id,
              ...details,
            }
          }),
        )

        setSearchResults(results)
      }

      if (searchResults.length === 0) {
        setMessage({
          type: "info",
          content: "No results found.",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      setMessage({
        type: "error",
        content: error.message.includes("revert")
          ? "Search failed: " + error.message.split("revert")[1]
          : "Search failed: " + error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Search Missing Persons</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Search</h3>
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Search By</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="id"
                    checked={searchType === "id"}
                    onChange={() => setSearchType("id")}
                    className="form-radio"
                  />
                  <span className="ml-2">Case ID</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="division"
                    checked={searchType === "division"}
                    onChange={() => setSearchType("division")}
                    className="form-radio"
                  />
                  <span className="ml-2">Division</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchValue">
                {searchType === "id" ? "Case ID" : "Division Name"}
              </label>
              <input
                type={searchType === "id" ? "number" : "text"}
                id="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={searchType === "id" ? "Enter case ID" : "Enter division name (e.g., Dhaka)"}
                min={searchType === "id" ? "1" : undefined}
                required
              />
            </div>

            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Missing Persons by Division</h3>
          <div className="bg-gray-100 p-4 rounded">
            {divisionStats.length > 0 ? (
              <ul>
                {divisionStats.map((stat, index) => (
                  <li key={index} className="flex justify-between py-1">
                    <span>{stat.division}</span>
                    <span className="font-semibold">{stat.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Loading statistics...</p>
            )}
          </div>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Age</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Urgency</th>
                  <th className="py-3 px-6 text-left">Division</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {searchResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{result.id}</td>
                    <td className="py-3 px-6 text-left">{result.name}</td>
                    <td className="py-3 px-6 text-left">{result.age}</td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${
                          result.status === "0" ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"
                        }`}
                      >
                        {result.status === "0" ? "Missing" : "Found"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${
                          Number(result.age) < 18
                            ? "bg-red-200 text-red-700"
                            : Number(result.age) > 50
                              ? "bg-yellow-200 text-yellow-700"
                              : "bg-blue-200 text-blue-700"
                        }`}
                      >
                        {Number(result.age) < 18 ? "High" : Number(result.age) > 50 ? "Medium" : "Low"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">{divisionNames[result.lastSeen]}</td>
                    <td className="py-3 px-6 text-left">
                      <Link
                        to={`/missing/${result.id}`}
                        className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                      >
                        View Details
                      </Link>
                    </td>
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

export default SearchMissingPerson
