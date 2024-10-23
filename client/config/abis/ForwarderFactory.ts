export const ForwarderFactoryABI = [
    {
        "inputs": [
            {
                "internalType": "contract ISwapRouter",
                "name": "_swapRouter",
                "type": "address"
            },
            {
                "internalType": "contract IQuoter",
                "name": "_swapQuoter",
                "type": "address"
            },
            {
                "internalType": "contract IWeth",
                "name": "_weth",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AlreadyInitialized",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ERC1167FailedCreateClone",
        "type": "error"
    },
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
        "inputs": [],
        "name": "implementation",
        "outputs": [
            {
                "internalType": "contract IForwarder",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "swapQuoter",
        "outputs": [
            {
                "internalType": "contract IQuoter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "swapRouter",
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
        "name": "weth",
        "outputs": [
            {
                "internalType": "contract IWeth",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export const FlushType = [{
    name: "token",
    type: "address"
},
{
    name: "amount",
    type: "uint256"
},
{
    name: "amountOutMinimum",
    type: "uint256"
},
{
    name: "swapFee",
    type: "uint24"
},
{
    name: "swapDeadline",
    type: "uint256"
},
{
    name: "sqrtPriceLimitX96",
    type: "uint104"
},
{
    name: "relayerFee",
    type: "uint256"
},
{
    name: "nonce",
    type: "uint256"
}]