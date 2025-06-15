import React from 'react';

function SettingsPage() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
            <p className="text-gray-600 mb-8">Manage your account preferences and application settings here.</p>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="notifications" className="text-lg font-medium text-gray-700">Enable Notifications</label>
                    <input type="checkbox" id="notifications" className="form-checkbox h-5 w-5 text-indigo-600 rounded-md focus:ring-indigo-500" />
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" id="email" defaultValue="user@example.com" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" />
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="theme" className="block text-lg font-medium text-gray-700 mb-2">Theme</label>
                    <select id="theme" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                        <option>Light</option>
                        <option>Dark</option>
                    </select>
                </div>
                <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
                    Save Settings
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;
