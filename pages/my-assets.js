/* pages/my-assets.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftmarketaddress, nftaddress, nftccaddress, contractfactorynftaddress
} from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTCC from '../artifacts/contracts/NFTCC.sol/NFTCC.json'
import ContractFactoryNFT from '../artifacts/contracts/ContractFactoryNFT.sol/ContractFactoryNFT.json'


export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [mintedNfts, setMintedNfts] = useState([])
  const [mintedCollections, setMintedCollections] = useState([])
  const [collectionAddresses, setCollectionAddresses] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
    loadMintedNFTs()
    loadCollections()
  }, [])
  async function loadNFTs() {
    console.log("======loadPurchasedNFTs=======")
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    console.log("==========fetchMy-PURCHASED-NFTs data==========")
    console.log(data)
    setNfts(items)
    setLoadingState('loaded') 
  }


  async function loadMintedNFTs() {
    console.log("======loadMintedNFTs=======")
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const accounts = await provider.listAccounts()
    const userAccount = accounts[0]

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    // const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const tokenContract = new ethers.Contract(nftccaddress, NFTCC.abi, provider)

    const nftData = await marketContract.fetchMyPersonalNFTs()

    const items = await Promise.all(nftData.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      // let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      console.log(i)
      let item = {
        tokenId: i.tokenId.toNumber(),
        name: meta.data.name,
        description: meta.data.description,
        owner: i.owner,
        image: meta.data.image
      }
      return item
    }))
    console.log("==========fetchMy-MINTED-NFTs data==========")
    console.log(nftData)
    setMintedNfts(items)
    setLoadingState('loaded') 
  }

  async function loadCollections() {
    console.log("====== loadCollections =======")
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const accounts = await provider.listAccounts()
    const userAccount = accounts[0]

    const factoryContract = new ethers.Contract(contractfactorynftaddress, ContractFactoryNFT.abi, signer)
    // const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    const nftData = await factoryContract.getCollections()
    let collectionSets = []
    let collectionAddrs = []
    const items = await Promise.all(nftData.map(async i => {
      let collectionItems = []
      collectionAddrs.push(i[0])
      // console.log("collection items:")
      // console.log(i)
      // console.log(i.tokenURIs)
      const collectionURIs = i.tokenURIs
      // console.log("collectionURIs")
      // console.log(collectionURIs)
      for (let n = 0; n < collectionURIs.length; n++ ) {
        const meta = await axios.get(collectionURIs[n])
        console.log("meta")
        console.log(meta)
        let collectionItem = {
          image: meta.data.image,
          description: meta.data.description,
          tokenName: meta.data.tokenName,
          tokenSymbol: meta.data.tokenSymbol
        }
        collectionItems.push(collectionItem)
        // return collectionItem
        
      }
      // console.log("collectionItems")
      // console.log(collectionItems)
      collectionSets.push(collectionItems)
    }))
    console.log("collectionSets")
    console.log(collectionSets)
    console.log("========== loadCollections ==========")
    setMintedCollections(collectionSets)
    setCollectionAddresses(collectionAddrs)
    console.log("collectionAddresses")
    console.log(collectionAddresses)
    setLoadingState('loaded') 
  }

  if (loadingState === 'loaded' && (!mintedNfts.length && !nfts.length && !mintedCollections.length)) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <div>
      <p className="text-2xl p-2 font-bold"> Purchased NFTs:</p>
      <div className="flex justify-center">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} className="rounded" />
                  <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} MATIC</p>
                </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {/* <p className="text-2xl p-2  font-bold border-b"> Minted Personal NFTs:</p>
      <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            mintedNfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div> */}
    <p className="text-2xl p-2 font-bold"> Minted NFT Collections:</p>
      <div className="flex justify-center">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              mintedCollections.map((collection, i) => (
                collection.map((nft, n) => (
                  <div key={n} style={{alignSelf: 'end'}} className="border shadow rounded-xl overflow-hidden">
                  {/* <div key={n} className="border shadow rounded-xl overflow-hidden"> */}

                    <img src={nft.image} className="rounded" />
                      <div className="p-4">
                      <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.tokenName}</p>
                        <div style={{ height: '70px', overflow: 'hidden' }}>
                          <p className="text-gray-400">{nft.description}</p>
                        </div>
                      </div>
                    <div className="p-4 bg-black">
                      <p className="text-2xl mb-4 font-bold text-white">{nft.tokenSymbol}</p>
                    </div>
                  </div>
              ))
            ))
          }
          </div>
        </div>
      </div>
  </div>
  )
}