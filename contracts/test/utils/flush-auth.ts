import { ethers } from "hardhat"
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

export async function authorizeFlush(signer: HardhatEthersSigner, forwarderAddress: string, flushParams: {
    token: string,
    amount: bigint,
    amountOutMinimum: bigint,
    swapFee: bigint,
    swapDeadline: bigint,
    sqrtPriceLimitX96: bigint,
    relayerFee: bigint,
}) {
    const forwarder = await ethers.getContractAt("IForwarder", forwarderAddress, signer)

    // get the current nonce for the deployer address
    const nonce = await forwarder.getNonce();

    // set the domain parameters
    const domain = {
        name: "Forwarder",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: forwarderAddress
    };

    // set the Permit type parameters
    const types = {
        Flush: [{
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
        }
        ],
    };

    // set the Permit type values
    const values = {
        ...flushParams,
        nonce: nonce
    };

    // sign the Permit type data with the deployer's private key
    const signature = await signer.signTypedData(domain, types, values);

    return signature
}