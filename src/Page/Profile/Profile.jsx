import { useState } from "react"

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("John Doe")
  const [email] = useState("john@example.com")
  const [subject, setSubject] = useState("Math")
  const [pin, setPin] = useState("1234")
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (oldPin === pin) {
      setPin(newPin)
      setIsEditing(false)
      setOldPin("")
      setNewPin("")
    } else {
      alert("Incorrect old PIN")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setOldPin("")
    setNewPin("")
  }

  return (
    <div className="">
       <div className="space-y-6 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        </div>
      </div>
      {isEditing ? (
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Math">Math</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="CSE">CSE</option>
            </select>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Update PIN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old PIN</label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <span className="block text-sm font-medium text-gray-500 mb-1">Name</span>
              <span className="text-lg text-gray-900">{name}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
              <span className="text-lg text-gray-900">{email}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <span className="block text-sm font-medium text-gray-500 mb-1">Subject</span>
            <span className="text-lg text-gray-900">{subject}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <span className="block text-sm font-medium text-gray-500 mb-1">PIN</span>
            <span className="text-lg text-gray-900">****</span>
          </div>
          <button
            onClick={handleEdit}
            className="mt-6 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileSection

