// contracts/NFTMarket.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
   Counters.Counter private _mintedItemIds;

  address payable owner;
  // commission that contract owner received (0.025 MATIC)
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }
  mapping(uint256 => MarketItem) private idToMarketItem;
  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  // Personal NFT
  struct PersonalItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable owner;
  }

  mapping(uint256 => PersonalItem) private idToPersonalItem;

  event PersonalItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address owner
  );

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  function createPersonalItem(address nftContract, uint256 tokenId) public payable nonReentrant {
    // require(price > 0, "Price must be at least 1 wei");
    // require(msg.value == listingPrice, "Price must be equal to listing price");

    _mintedItemIds.increment();
    uint256 _mintedItemId = _mintedItemIds.current();

    idToPersonalItem[_mintedItemId] =  PersonalItem(
      _mintedItemId,
      nftContract,
      tokenId,
      payable(msg.sender)
    );
    // Transfers ownership from msg.sender to this contract address. Add more functionality to allow
    // users to cancel listing
    // IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    // emit PersonalItemCreated(itemId,nftContract,tokenId,msg.sender);
  }

  /* Places an item for sale on the marketplace */
  function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );
    // Transfers ownership from msg.sender to this contract address. Add more functionality to allow
    // users to cancel listing
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(itemId,nftContract,tokenId,msg.sender,address(0),price,false);
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");
    // seller recieves money
    idToMarketItem[itemId].seller.transfer(msg.value);
    // this contract transfers ownership to msg.sender (a.k.a. buyer)
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    // set owner of idToMarketItem in our struct for book-keeping 
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    // pays contract owner the listing price when nft sells.
    payable(owner).transfer(listingPrice);
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender || idToPersonalItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchMyPersonalNFTs() public view returns (PersonalItem[] memory) {
    uint totalItemCount = _mintedItemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToPersonalItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    PersonalItem[] memory items = new PersonalItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender || idToPersonalItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        PersonalItem storage currentItem = idToPersonalItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  
}