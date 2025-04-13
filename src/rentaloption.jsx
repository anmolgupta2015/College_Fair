"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"

export default function RentalOptions({ listing }) {
  const [rentalDays, setRentalDays] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const rentalPrice = 0
  const totalRentalCost = rentalPrice * rentalDays

  const handleRentalDaysChange = (e) => {
    const days = Number.parseInt(e.target.value)
    if (days > 0 && days <= 30) {
      setRentalDays(days)
      if (startDate) {
        const start = new Date(startDate)
        const end = new Date(start)
        end.setDate(start.getDate() + days - 1)
        setEndDate(end.toISOString().split("T")[0])
      }
    }
  }

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)
    if (newStartDate) {
      const start = new Date(newStartDate)
      const end = new Date(start)
      end.setDate(start.getDate() + rentalDays - 1)
      setEndDate(end.toISOString().split("T")[0])
    } else {
      setEndDate("")
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Rental Options</h3>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rental-days" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Days
          </label>
          <input
            type="number"
            id="rental-days"
            min="1"
            max="30"
            value={rentalDays}
            onChange={handleRentalDaysChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Date Summary */}
      {startDate && endDate && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center text-purple-700 font-medium mb-2">
            <Calendar className="h-5 w-5 mr-2" />
            Rental Period
          </div>
          <div className="text-sm text-purple-800">
            From: <strong>{new Date(startDate).toLocaleDateString()}</strong><br />
            To: <strong>{new Date(endDate).toLocaleDateString()}</strong><br />
            Total: <strong>{rentalDays} day(s)</strong>
          </div>
        </div>
      )}

      {/* Cost Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Daily Rate:</span>
          <span className="font-medium">₹{rentalPrice}/day</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Number of Days:</span>
          <span className="font-medium">{rentalDays} day(s)</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-purple-700 pt-2 border-t border-gray-100 mt-2">
          <span>Total Rental Cost:</span>
          <span>₹{totalRentalCost}</span>
        </div>
      </div>

      {/* Security Deposit */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-900 text-sm">
        <strong>Security Deposit:</strong> ₹100<br />
        <span className="text-xs">Refundable upon return in original condition.</span>
      </div>
    </div>
  )
}
