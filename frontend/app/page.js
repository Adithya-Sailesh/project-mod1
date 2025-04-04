import React from 'react'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-100 p-6">
      <div className="max-w-3xl text-center bg-black-100 shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome to Auto-ID 🚗
        </h1>
        <p className="text-white-900 text-lg mb-6">
          Auto-ID is an advanced number plate detection system designed to 
          streamline vehicle identification and toll collection. Upload a 
          traffic video, and our system will process it in real time, 
          detecting and classifying vehicles efficiently.
        </p>
        <h2 className="text-xl font-semibold text-white-800 mb-2">
          Key Features:
        </h2>
        <ul className="text-white-700 text-left list-disc list-inside">
          <li>🚘 Real-time vehicle identification</li>
          <li>📹 Process traffic videos with high accuracy</li>
          <li>💳 Automated toll fee collection and wallet management</li>
          <li>⚡ Instant user notifications and transaction history</li>
        </ul>
      </div>
    </div>
  );
  
}

export default Home