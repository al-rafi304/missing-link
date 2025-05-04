"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { EthProvider } from "./contexts/EthContext"
import Navbar from "./components/Navbar"
import UserRegistration from "./components/UserRegistration"
import AddMissingPerson from "./components/AddMissingPerson"
import UpdateMissingStatus from "./components/UpdateMissingStatus"
import AssignInvestigator from "./components/AssignInvestigator"
import SearchMissingPerson from "./components/SearchMissingPerson"
import BookAppointment from "./components/BookAppointment"
import ViewAppointments from "./components/ViewAppointments"
import MissingPersonDetails from "./components/MissingPersonDetails"
import Home from "./components/Home"
import { Component } from "react"

// Error boundary to catch runtime errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an error. Please try refreshing the page.</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs mb-4">
              {this.state.error && this.state.error.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <EthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<UserRegistration />} />
                <Route path="/add-missing" element={<AddMissingPerson />} />
                <Route path="/update-status" element={<UpdateMissingStatus />} />
                <Route path="/assign-investigator" element={<AssignInvestigator />} />
                <Route path="/search" element={<SearchMissingPerson />} />
                <Route path="/missing/:id" element={<MissingPersonDetails />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/appointments" element={<ViewAppointments />} />
              </Routes>
            </div>
          </div>
        </Router>
      </EthProvider>
    </ErrorBoundary>
  )
}

export default App
