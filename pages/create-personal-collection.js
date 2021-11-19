/* pages/create-item.js */
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import switchNetworkMatic from './my-assets'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  contractfactorynftaddress,
} from '../config'

import ContractFactoryNFT from '../artifacts/contracts/ContractFactoryNFT.sol/ContractFactoryNFT.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState([])
  const [metadataURL, setMetadataUrl] = useState([])
  const [fileAmount, setFileAmount] = useState(0)
  const [ awaitingConfirmation, setAwaitingConfirmation ] = useState(0)
  const [formInput, updateFormInput] = useState({ tokenName: '', description: '', tokenSymbol: '', tokenAmount: '' })
  const [blockExplorerLink, setBlockExplorerLink] = useState('')

  const router = useRouter()

  
  async function onChange(e) {
    // console.log("e.target.files")
    // console.log(e.target.files)
    let fileUrls = []
    const files = e.target.files
    const tokenAmt = files.length
    console.log("files.length")
    console.log(files.length)
    for (let i = 0; i < files.length; i++ ) {
      try {
        const added = await client.add(
          files[i],
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        let url = `https://ipfs.infura.io/ipfs/${added.path}`
        console.log("onChange URL")
        console.log(url)
        // fileUrl.push(url)
        fileUrls.push(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }
    setFileAmount(tokenAmt)
    console.log(":::fileUrls:::")
    console.log(fileUrls)
    setFileUrl(fileUrls)
    console.log("===fileUrl===")
    console.log(fileUrl)
    console.log(":::fileAmount:::")
    console.log(fileAmount)
  }
  async function createMarket() {
    const { tokenName, description, tokenSymbol } = formInput
    if (!tokenName || !description || !fileUrl || !tokenSymbol ) return
    /* first, upload to IPFS */
    for (let i = 0; i < fileUrl.length; i++ ) {
      const data = JSON.stringify({
        tokenName, description, tokenSymbol, tokenAmount: fileAmount, image: fileUrl[i]
      })
      console.log("data")
      console.log(data)
      try {
        let added = await client.add(data)
        let url = `https://ipfs.infura.io/ipfs/${added.path}`
        console.log("JSON meta data url")
        console.log(url)
        metadataURL.push(url)
        /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
        // createSale(url, tokenName, tokenSymbol, amount)
      } catch (error) {
        console.log('Error uploading file: ', error)
      } 
    }
    createSale(metadataURL, tokenName, tokenSymbol, fileAmount)
  }

  async function createSale(urls, tokenName, tokenSymbol, tokenAmount) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    /* next, create the item */
    let contract = new ethers.Contract(contractfactorynftaddress, ContractFactoryNFT.abi, signer)
    let transaction = await contract.deploy(tokenName, tokenSymbol, urls, tokenAmount)
    console.log("setting these as URIs:")
    console.log(urls)
    setAwaitingConfirmation(1)
    let tx = await transaction.wait()
    let txHash = tx.transactionHash
    setBlockExplorerLink("https://polygonscan.com/tx/"+txHash)
    console.log("txHash: ", txHash)
    console.log("blockExplorerLink: ", blockExplorerLink)
    setAwaitingConfirmation(2)
    // let event = tx.events[0]
    // router.push('/my-assets')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <p className="text-2xl pt-6 font-bold">Tokens in collection: {fileAmount} </p>
      <input 
          placeholder="Token Symbol (i.e. BAYC)"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, tokenSymbol: e.target.value })}
        />
        <input 
          placeholder="Token Name (i.e. BoredApeYachtClub)"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, tokenName: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
          <p className="pt-2">*Hold CTRL and click to select multiple images</p>
          <input
            id="files"
            type="file"
            multiple
            name="Asset"
            accept="image/png, image/gif, image/jpeg"
            className="my-1"
            onChange={onChange}
          />
        
        {
          fileUrl.map((url, i) => (
          <img key={i} className="rounded mt-4" width="350" src={url} />
          )) 
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Mint {fileAmount} NFTs
        </button>
        { awaitingConfirmation < 2 ? 
          <div>
            <p className="text-2xl p-2 font-bold">Don't leave this page. You will be redirected after minting is complete.</p>
            <p className="text-2xl p-2 font-bold">Transaction {awaitingConfirmation} of 1 processing... </p>
          </div>
          :
          <p className="text-2xl p-2 font-bold text-blue"> 
            <a href={blockExplorerLink}>
              {blockExplorerLink}
            </a>
          </p>
        }
      </div>
    </div>
  )
}