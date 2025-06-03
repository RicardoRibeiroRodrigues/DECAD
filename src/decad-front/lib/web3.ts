import Web3 from "web3";
import contractABI from "./contractABI.json";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface MusicWork {
    title: string;
    artist: string;
    exists: boolean;
}

let web3: Web3;

if (typeof window !== "undefined" && window.ethereum) {
    // Use the injected provider from MetaMask or other wallet
    web3 = new Web3(window.ethereum);

    const connectedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Connected account:', connectedAccounts[0]);
} else {
    // Server-side or fallback
    const provider = new Web3.providers.HttpProvider("http://localhost:8545");
    web3 = new Web3(Web3.givenProvider || provider);
}

const musicContract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

async function getAllMusicWorks() : Promise<(MusicWork & { id: number })[]> {
    try {
        const last_id: number = await musicContract.methods.next_music_id().call();
        console.log("Last music ID:", last_id);
        let musicWorks : (MusicWork & { id: number })[] = [];
        for (let i = 0; i < last_id; i++) {
            const musicWork: MusicWork = await musicContract.methods.music_registry(i).call();
            musicWorks.push({
                id: i,
                title: musicWork.title,
                artist: musicWork.artist,
                exists: musicWork.exists,
            });
        }
        console.log("Fetched music works:", musicWorks);
        return musicWorks;
    } catch (error) {
        console.error("Error fetching music works:", error);
        throw error;
    }
}

async function payForMusicWork(id: number, amount: number) {
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
}

export { web3, musicContract, getAllMusicWorks, payForMusicWork };
