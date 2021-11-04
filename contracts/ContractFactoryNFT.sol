// contracts/ContractFactoryNFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
// import "./Collection.sol";

contract Collection is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory myName, string memory mySymbol) ERC721(myName, mySymbol) {
    }

    function mint(address player, string[] memory tokenURI, uint totalSupply) public {
        for(uint256 i = 0; i < totalSupply; i++){
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(player, newItemId);
            _setTokenURI(newItemId, tokenURI[i]);
        }
    }
}


contract ContractFactoryNFT {

    struct Collections {
        // address[] contractAddresses;
        UserCollectionItem[] items;
        uint256 collectionCount;
    }
    struct UserCollectionItem {
        address contractAddress;
        string name;
        string symbol;
        string[] tokenURIs;
        uint256 tokenAmount;
    }
    mapping(address => Collections) private collectionTracker;

    address[] public contracts;
    address public lastContractAddress;       

    function getContractCount() public view returns(uint contractCount) {
        return contracts.length;
    }

     // deploy a new purchase contract
    function deploy(string memory name, string memory symbol, string[] memory tokenURI, uint256 totalSupply) public returns(address newContract){
        Collection c = new Collection(name,symbol);
        address cAddr = address(c);
        contracts.push(cAddr);   
        lastContractAddress = cAddr;
        c.mint(msg.sender, tokenURI, totalSupply);
        // append to the list of contracts msg.sender has created
        UserCollectionItem memory myItem = UserCollectionItem(cAddr, name, symbol, tokenURI, totalSupply);
        collectionTracker[msg.sender].items.push(myItem);
        collectionTracker[msg.sender].collectionCount += 1;
        return cAddr;
    }  

    function getCollections() public view returns(UserCollectionItem[] memory) {
        UserCollectionItem[] memory userItems = new UserCollectionItem[](collectionTracker[msg.sender].collectionCount);
        for (uint i = 0; i < collectionTracker[msg.sender].collectionCount; i++) {
            UserCollectionItem storage currentItem = collectionTracker[msg.sender].items[i];    
            userItems[i] = currentItem;
        }
        return userItems;
    }

    // test,tst,["myURI"],1
    // test2,tst2,["myURI2","myURI22"],2
    // test3,tst3,["myURI3"],1

    // function mint(Collection tokenAddress, string memory tokenURI) public {
    //   tokenAddress.mint(msg.sender, tokenURI);
    // }       
}