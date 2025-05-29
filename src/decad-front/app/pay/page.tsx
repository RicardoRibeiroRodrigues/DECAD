// pages/pay.js
'use client';

import { useEffect, useState } from 'react';
import { web3, musicContract, getAllMusicWorks, MusicWork } from '../../lib/web3';

export default function PayPage() {
  const [works, setWorks] = useState<(MusicWork & { id: number })[]>([]);

  useEffect(() => {
    const load = async () => {
        const loadedWorks = await getAllMusicWorks();
        setWorks(loadedWorks);
    }

    load();
  }, []);

  const handlePay = async (id : number, amount: number) => {
    const accounts = await web3.eth.getAccounts();
    await musicContract.methods.pay_and_distribute(id).send({
      from: accounts[0],
      value: web3.utils.toWei(amount, "ether"),
    })
    .then(function (receipt) {
      console.log("Transaction receipt:", receipt);
      alert("Payment successful!");
    })
    .catch(function (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Support Artists</h1>
      <ul className="space-y-4">
        {works.map((w) => (
          <li key={w.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{w.title}</h2>
            <p className="text-sm">Artist: {w.artist}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600 transition cursor-pointer"
              onClick={() => handlePay(w.id, 1)}
            >
              Pay 1 ETH
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
