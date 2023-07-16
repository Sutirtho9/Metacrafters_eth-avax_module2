import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }



  const deposit = async () => {
    if (atm) {
      const depositAmount = document.getElementById("depositAmount").value;
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };
  
  const withdraw = async () => {
    if (atm) {
      const withdrawAmount = document.getElementById("withdrawAmount").value;
      if (balance < withdrawAmount){
        alert("Balance insufficient")
      }
      else{
        let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      }
    }
  };
  

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

 
    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="number" id="depositAmount" placeholder="Enter amount to deposit" />
        <button onClick={deposit}>Deposit</button>
        <input type="number" id="withdrawAmount" placeholder="Enter amount to withdraw" />
        <button onClick={withdraw}>Withdraw</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome To Your Ethereum Wallet</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: lightblue;
          padding: 20px;
          border-radius: 8px;
        }
        h1 {
          color: darkblue;
        }
        p {
          font-size: 400px;
        }
      `}
      </style>
    </main>
  )
}