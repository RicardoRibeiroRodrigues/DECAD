// pages/pay.js
'use client';

import { useEffect, useState } from 'react';
import { getAllMusicWorks, MusicWork, payForMusicWork } from '../../lib/web3';

export default function PayPage() {
  const [works, setWorks] = useState<(MusicWork & { id: number })[]>([]);
  const [amounts, setAmounts] = useState<{[key: number]: string }>({});

  useEffect(() => {
    const load = async () => {
        const loadedWorks = await getAllMusicWorks();
        setWorks(loadedWorks);
    }

    load();
  }, []);

  const handleAmountChange = (id: number, value: string) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handlePay = async (id : number) => {
    let amountStr = amounts[id];
    let amount = parseFloat(amountStr); // Ensure 3 decimal places

    if (!amountStr || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to pay.");
      return;
    }
    
    if (amount < 0.001) {
      alert("Minimum payment is 0.001 ETH.");
      return;
    }

    await payForMusicWork(id, amount);
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Support Artists</h1>
      <ul className="space-y-4">
        {works.map((w) => (
          <li key={w.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{w.title}</h2>
            <p className="text-sm text-gray-600">Artist: {w.artist}</p>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="Amount in ETH"
                className="border rounded px-3 py-1 w-40"
                value={amounts[w.id] || ''}
                onChange={(e) => handleAmountChange(w.id, e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => handlePay(w.id)}
              >
                Pay
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
