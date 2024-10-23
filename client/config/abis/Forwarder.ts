export const ForwarderABI = [
    {
        "inputs": [],
        "name": "ECDSAInvalidSignature",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "length",
                "type": "uint256"
            }
        ],
        "name": "ECDSAInvalidSignatureLength",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "ECDSAInvalidSignatureS",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "EmptyBalance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FailedEthTransfer",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receipient",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FailedTokenTransfer",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidInitialization",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requested",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "actual",
                "type": "uint256"
            }
        ],
        "name": "NotEnoughForFees",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotInitializing",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnauthorizedFlush",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "ForwarderFlushed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint64",
                "name": "version",
                "type": "uint64"
            }
        ],
        "name": "Initialized",
        "type": "event"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountOutMinimum",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint24",
                        "name": "swapFee",
                        "type": "uint24"
                    },
                    {
                        "internalType": "uint256",
                        "name": "swapDeadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint104",
                        "name": "sqrtPriceLimitX96",
                        "type": "uint104"
                    },
                    {
                        "internalType": "uint256",
                        "name": "relayerFee",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IForwarder.FlushParams",
                "name": "params",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "flushNative",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "flushToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountOutMinimum",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint24",
                        "name": "swapFee",
                        "type": "uint24"
                    },
                    {
                        "internalType": "uint256",
                        "name": "swapDeadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint104",
                        "name": "sqrtPriceLimitX96",
                        "type": "uint104"
                    },
                    {
                        "internalType": "uint256",
                        "name": "relayerFee",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IForwarder.FlushParams",
                "name": "params",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "flushTokenWithNative",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getForwardTo",
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
        "name": "getNonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
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
            },
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
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint24",
                "name": "swapFee",
                "type": "uint24"
            },
            {
                "internalType": "uint160",
                "name": "sqrtPriceLimitX96",
                "type": "uint160"
            }
        ],
        "name": "quoteSwapForNative",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
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
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]