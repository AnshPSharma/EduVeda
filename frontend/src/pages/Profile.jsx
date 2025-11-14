import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Profile = () => {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!currentUser) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleDeleteAccount = async () => {
    // Validate currentUser exists and has ID
    if (!currentUser || !currentUser.id) {
      console.error(
        "❌ Cannot delete account: currentUser or currentUser.id is missing",
        currentUser
      );
      toast.error("Unable to delete account. Please refresh and try again.");
      return;
    }

    console.log("🗑️ Starting account deletion for user:", currentUser.id);

    // Show password input modal directly
    setShowDeleteModal(true);
  };

  const handleFinalDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password");
      return;
    }

    console.log("✅ Password provided, proceeding with deletion...");

    setDeleting(true);

    try {
      // Delete user account using axios with password confirmation
      console.log(`🗑️ Deleting user account ${currentUser.id}...`);
      const response = await axios.delete(`/api/v1/users/${currentUser.id}`, {
        data: { password: deletePassword }
      });

      if (response.status === 200) {
        console.log("✅ Account deletion completed successfully");
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      } else {
        toast.error("Failed to delete account");
      }
    } catch (err) {
      console.error("❌ Error deleting account:", err);
      if (err.response?.status === 401) {
        toast.error("Incorrect password");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete account");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/edit-profile")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <p className="mt-1 text-lg text-gray-900">
              {currentUser.name || currentUser.username}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-lg text-gray-900">{currentUser.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <p className="mt-1 text-lg text-gray-900">{currentUser.role}</p>
          </div>
          {currentUser.bio && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <p className="mt-1 text-gray-700">{currentUser.bio}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Created
            </label>
            <p className="mt-1 text-gray-700">
              {currentUser.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-gray-700 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Delete Account
        </button>
      </div>

      {/* Password Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-red-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Please enter your password to confirm account deletion:
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Enter your password"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={handleFinalDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
