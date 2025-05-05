"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useEth from "../contexts/EthContext/useEth"

const Navbar = () => {
  const {
    state: { contracts, accounts },
  } = useEth()
  const [userRole, setUserRole] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userName, setUserName] = useState(null)

  useEffect(() => {
    const checkUserRole = async () => {
      if (!contracts || !accounts) return

      try {
        // Check if user is registered
        try {
          const userDetails = await contracts.userManagement.methods.getUserDetails(accounts[0]).call()
          setIsRegistered(true)
          setUserRole(Number.parseInt(userDetails.role))
          setUserName(userDetails.name)
        } catch (error) {
          // User not registered
          setIsRegistered(false)
          setUserRole(null)
        }
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }

    checkUserRole()
  }, [accounts, contracts])

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Missing Link
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-200">
            Home
          </Link>

          {!isRegistered && (
            <Link to="/register" className="hover:text-blue-200">
              Register
            </Link>
          )}

          {isRegistered && (
            <>
              <Link to="/search" className="hover:text-blue-200">
                Search
              </Link>
              <Link to="/appointments" className="hover:text-blue-200">
                Appointments
              </Link>

              {userRole === 1 && ( // Reporter
                <>
                  <Link to="/add-missing" className="hover:text-blue-200">
                    Report Missing
                  </Link>
                  <Link to="/book-appointment" className="hover:text-blue-200">
                    Book Appointment
                  </Link>
                </>
              )}

              {userRole === 0 && ( // Admin
                <>
                  <Link to="/update-status" className="hover:text-blue-200">
                    Update Status
                  </Link>
                  <Link to="/assign-investigator" className="hover:text-blue-200">
                    Assign Investigator
                  </Link>
                </>
              )}

              {/* {userRole === 2 && ( // Investigator
                <Link to="/my-cases" className="hover:text-blue-200">
                  My Cases
                </Link>
              )} */}
            </>
          )}
        </div>
        <div className="text-sm">
          {accounts ? (
            <span>
              Connected: { isRegistered ? userName : accounts[0].substring(0, 6)}
            </span>
          ) : (
            <span>Not connected</span>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
