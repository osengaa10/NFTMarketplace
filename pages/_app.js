/* pages/_app.js */
import { useState, useEffect } from 'react'
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  const [chain, setChain] = useState('')
  const [account, setAccount] = useState('')


  useEffect(() => {
    checkConnectedChain()
    checkConnectedAccount()
  }, [chain, account])

  const checkConnectedChain = async () => {
    setChain(await String(window.ethereum.chainId))
    console.log(chain)
  }

  const checkConnectedAccount = async () => {
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // setAccount({
      //   accounts: await ethereum.request({ method: "eth_requestAccounts" })
      // })
      let userAccounts = await ethereum.request({ method: "eth_requestAccounts" })
      console.log("userAccounts:")
      console.log(userAccounts)
      setAccount(userAccounts[0])
    } catch (error) {
    }
    console.log("account state:")
    console.log(account)
  }

  const switchNetworkMumbai = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon",
                rpcUrls: ["https://polygon-rpc.com"],
                nativeCurrency: {
                  name: "Matic",
                  symbol: "Matic",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://polygonscan.com"],
              },
            ],
          });
        } catch (addError) {
          alert(addError);
        }
      }
    }
  }


  return (
    <div>
      <p className="text-4xl p-3 font-bold">Metaverse Marketplace</p>
      {chain === '0x89' && account!= ''?
        // <button onClick={switchNetworkMumbai} className="font-bold mb-2 mr-2 float-right bg-pink-500 text-white rounded p-3 shadow-lg">
        //    {account &&
        //     `${account.slice(0, 6)}...${account.slice(
        //       account.length - 4,
        //       account.length
        //     )}`}
        // </button>
        <p className="font-bold mb-2 mr-2 float-right text-black rounded p-3 shadow-lg">
        connected: {account} 
        {/* {account &&
         `${account.slice(0, 6)}...${account.slice(
           account.length - 4,
           account.length
         )}`} */}
     </p>
        :
        <button onClick={switchNetworkMumbai} className="font-bold mb-2 float-right bg-pink-500 text-white mr-3 rounded p-3 shadow-lg">
            connect to Polygon
        </button>
      }    
      <nav className="border-b p-3">
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              Marketplace
            </a>
          </Link>
          <Link href="./create-item">
            <a className="mr-6 text-pink-500">
              Mint to Sell
            </a>
          </Link>
          <Link href="./create-personal-item">
            <a className="mr-6 text-pink-500">
              Mint to Own
            </a>
          </Link>
          <Link href="./my-assets">
            <a className="mr-6 text-pink-500">
              My NFTs
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              Sales History
            </a>
          </Link>
          <Link href="/create-personal-collection">
            <a className="mr-6 text-pink-500">
              Create Collection
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp