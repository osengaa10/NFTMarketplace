/* pages/create-item.js */
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
//   nftaddress, 
  nftmarketaddress, 
  contractfactorynftaddress,
} from '../config'

// import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import ContractFactoryNFT from '../artifacts/contracts/ContractFactoryNFT.sol/ContractFactoryNFT.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ tokenName: '', description: '', tokenSymbol: '', amount: 0 })
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(0)
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function createMarket() {
    const { tokenName, description, tokenSymbol, amount } = formInput
    if (!tokenName || !description || !fileUrl || !tokenSymbol || !amount) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
        tokenName, description, tokenSymbol, amount, image: fileUrl
    })
    console.log(data)
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url, tokenName, tokenSymbol, amount)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url, tokenName, tokenSymbol, amount) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    /* next, create the item */
    let contract = new ethers.Contract(contractfactorynftaddress, ContractFactoryNFT.abi, signer)
    let transaction = await contract.deploy(tokenName, tokenSymbol, url, amount)
    console.log("setting this as URI:")
    console.log(url)
    setAwaitingConfirmation(1)
    let tx = await transaction.wait()
    let event = tx.events[0]
    console.log("tx")
    console.log(tx)
    console.log("event")
    console.log(event)
    // let value = event.args[2]
    // let tokenId = value.toNumber()
    // console.log(tokenId)
    // /* then list the item for sale on the marketplace */
    // contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    // transaction = await contract.createPersonalItem(nftccaddress, tokenId)
    // setAwaitingConfirmation(2)
    // await transaction.wait()
    router.push('/my-assets')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      <input 
          placeholder="Token Symbol"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, tokenSymbol: e.target.value })}
        />
      <input 
          placeholder="Total Supply"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, amount: e.target.value })}
        />
        <input 
          placeholder="NFT Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, tokenName: e.target.value })}
        />
        <textarea
          placeholder="NFT Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Mint NFT
        </button>
        <p className="text-2xl p-2 font-bold"> Transaction {awaitingConfirmation} of 2 processing... </p>

      </div>
    </div>
  )
}