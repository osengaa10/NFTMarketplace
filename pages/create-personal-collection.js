/* pages/create-item.js */
import { useState } from 'react'
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
  const [fileUrl, setFileUrl] = useState([])
  const [metadataURL, setMetadataUrl] = useState([])
  const [fileAmount, setFileAmount] = useState(0)
  const [ awaitingConfirmation, setAwaitingConfirmation ] = useState(0)
  const [formInput, updateFormInput] = useState({ tokenName: '', description: '', tokenSymbol: '', tokenAmount: '' })
  const [blockExplorerLink, setBlockExplorerLink] = useState('')

  const router = useRouter()

  async function onChange(e) {
    console.log("e.target.files")
    console.log(e.target.files)
    // const file = e.target.files[0]
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
        fileUrl.push(url)
        // setFileUrl(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }
    // tokenAmount = fileUrl.length
    setFileAmount(tokenAmt)
    console.log("fileAmount")
    console.log(fileAmount)
    // console.log("urls")
    // console.log(urls)
    // // setFileUrl(urls)
    // console.log("fileUrl")
    // console.log(fileUrl)
    // try {
    //   const added = await client.add(
    //     file,
    //     {
    //       progress: (prog) => console.log(`received: ${prog}`)
    //     }
    //   )
    //   const url = `https://ipfs.infura.io/ipfs/${added.path}`
    //   setFileUrl(url)
    // } catch (error) {
    //   console.log('Error uploading file: ', error)
    // }  
  }
  async function createMarket() {
    console.log()
    const { tokenName, description, tokenSymbol, tokenAmount } = formInput
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
    // const data = JSON.stringify({
    //     tokenName, description, tokenSymbol, amount, image: fileUrl
    // })
    // console.log("data")
    // console.log(data)
    // try {
    //   const added = await client.add(data)
    //   const url = `https://ipfs.infura.io/ipfs/${added.path}`
    //   console.log("JSON meta data url")
    //   console.log(url)
    //   /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
    //   createSale(url, tokenName, tokenSymbol, amount)
    // } catch (error) {
    //   console.log('Error uploading file: ', error)
    // }  
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
    let event = tx.events[0]
    // console.log("tx")
    // console.log(tx)
    // console.log("event")
    // console.log(event)
    // let value = event.args[2]
    // let tokenId = value.toNumber()
    // console.log(tokenId)
    // /* then list the item for sale on the marketplace */
    // contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    // transaction = await contract.createPersonalItem(nftccaddress, tokenId)
    // setAwaitingConfirmation(2)
    // await transaction.wait()
    // router.push('/my-assets')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      {/* <input
          type="number" 
          placeholder="Total Supply"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, amount: e.target.value })}
        /> */}
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
          <p className="text-2xl p-2 font-bold"> Transaction {awaitingConfirmation} of 1 processing... </p>
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