"use client"

import { useState } from "react";
import { musicContract, web3 } from "../lib/web3";

export default function Home() {
  const [title, setTitle] = useState("");

  const handleRegister = async () => {
    const accounts = await web3.eth.getAccounts();
    await musicContract.methods.register_music(title).send({
      from: accounts[0],
    })
    .then(function (receipt) {
      console.log("Transaction receipt:", receipt);
      // Clear the input field after successful registration
      setTitle("");
      alert("Music registered!");
    })
    .catch(function (error) {
      console.error("Error registering music:", error);
      alert("Error registering music. Please try again.");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Register New Music</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your song"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}
