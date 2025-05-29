from web3 import Web3
import json
import os
import subprocess
from web3.gas_strategies.rpc import rpc_gas_price_strategy
import sys
from dotenv import load_dotenv

load_dotenv()
path = os.path.dirname(os.path.abspath(__file__))


# From first arg: test or deploy
if len(sys.argv) < 2:
    print("Usage: python deploy.py <test|deploy>")
    sys.exit(1)

test_mode = False
if sys.argv[1] == "test":
    provider = "http://127.0.0.1:8545"
    test_mode = True
elif sys.argv[1] == "deploy":
    provider = os.getenv("DEPLOY_ENDPOINT")
else:
    print("Invalid argument. Use 'test' or 'deploy'.")
    sys.exit(1)


def compile_contract_and_get_code():
    # Compile the Vyper contract
    # os.system(f"vyper -f abi,bytecode {path}/decad.vy > output.json")
    result = subprocess.run(
        ["vyper", "-f", "abi,bytecode", os.path.join(path, "decad.vy")],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("Compilation failed. Check your Vyper code.")
        print(result.stderr)
        sys.exit(1)

    return result.stdout.strip().split("\n")


# Compile the contract and get ABI and bytecode
abi, bytecode = compile_contract_and_get_code()


# Connect to Sepolia or local hardhat
w3 = Web3(Web3.HTTPProvider(provider))

# Set gas price strategy
w3.eth.set_gas_price_strategy(rpc_gas_price_strategy)

# Set your wallet
if test_mode:
    # Default account #1
    acct = w3.eth.account.from_key(os.getenv("TEST_PRIVATE_KEY"))
else:
    acct = w3.eth.account.from_key(os.getenv("PRIVATE_KEY"))

contract = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build & sign transaction
construct_txn = contract.constructor().build_transaction(
    {
        "from": acct.address,
        "nonce": w3.eth.get_transaction_count(acct.address),
        "gasPrice": w3.eth.generate_gas_price(),
    }
)

signed = w3.eth.account.sign_transaction(construct_txn, private_key=acct.key)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

# Wait and get contract address
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print("Contract deployed at:", tx_receipt.contractAddress)

# I want to save to ../decad-front/lib/contractABI.json, must be relative to this file
with open(os.path.join(path, "../decad-front/lib/contractABI.json"), "w") as f:
    abi = json.loads(abi)
    json.dump(abi, f)
print("ABI saved to ../decad-front/lib/contractABI.json")
