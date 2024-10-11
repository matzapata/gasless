export const ForwarderFactoryABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "forwarder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "forwardTo",
                "type": "address"
            }
        ],
        "name": "ForwarderCreated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "GAS_STATION",
        "outputs": [
            {
                "internalType": "contract IGasStation",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "SWAP_ROUTER",
        "outputs": [
            {
                "internalType": "contract ISwapRouter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "WETH",
        "outputs": [
            {
                "internalType": "contract IWETH",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_forwardTo",
                "type": "address"
            }
        ],
        "name": "createForwarder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_forwardTo",
                "type": "address"
            }
        ],
        "name": "getForwarder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IGasStation",
                "name": "_gasStation",
                "type": "address"
            },
            {
                "internalType": "contract IWETH",
                "name": "_weth",
                "type": "address"
            },
            {
                "internalType": "contract ISwapRouter",
                "name": "_swapRouter",
                "type": "address"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]