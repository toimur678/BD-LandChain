// src/contractConfig.ts

// 1. Your Deployment Address (from your logs)
export const CONTRACT_ADDRESS = "0xfc1975B18A2905B18f1dC297D4236A61470e874E";

// 2. The ABI matching the "Clean Version" contract we deployed
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "landUid", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "LandRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "landUid", "type": "string" }
    ],
    "name": "LandVerified",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getLandCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_index", "type": "uint256" }],
    "name": "getLandByIndex",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "landUid", "type": "string" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "string", "name": "surveyNumber", "type": "string" },
          { "internalType": "string", "name": "division", "type": "string" },
          { "internalType": "string", "name": "district", "type": "string" },
          { "internalType": "uint256", "name": "areaValue", "type": "uint256" },
          { "internalType": "string", "name": "areaUnit", "type": "string" },
          { "internalType": "string", "name": "gpsCoordinates", "type": "string" },
          { "internalType": "string", "name": "documentHash", "type": "string" },
          { "internalType": "uint256", "name": "registrationDate", "type": "uint256" },
          { "internalType": "bool", "name": "isVerified", "type": "bool" }
        ],
        "internalType": "struct LandRegistry.LandRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governmentOfficial",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_division", "type": "string" },
      { "internalType": "string", "name": "_district", "type": "string" },
      { "internalType": "string", "name": "_surveyNo", "type": "string" },
      { "internalType": "uint256", "name": "_areaValue", "type": "uint256" },
      { "internalType": "string", "name": "_areaUnit", "type": "string" },
      { "internalType": "string", "name": "_gpsCoordinates", "type": "string" },
      { "internalType": "string", "name": "_documentHash", "type": "string" }
    ],
    "name": "registerLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_landUid", "type": "string" }],
    "name": "verifyLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];