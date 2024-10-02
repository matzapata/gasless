import { ethers } from "hardhat"
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

export async function getPermitSignature(signer: HardhatEthersSigner, tokenAddress: string, spender: string, value: bigint, deadline: bigint = ethers.MaxUint256) {
    const token = await ethers.getContractAt("IERC20WithPermit", tokenAddress, signer)
    
    // get the current nonce for the deployer address
    const nonces = await token.nonces(signer.address);

    // set the domain parameters
    const domain = {
        name: await token.name(),
        version: await token.version(),
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: tokenAddress
    };

    // set the Permit type parameters
    const types = {
        Permit: [{
            name: "owner",
            type: "address"
        },
        {
            name: "spender",
            type: "address"
        },
        {
            name: "value",
            type: "uint256"
        },
        {
            name: "nonce",
            type: "uint256"
        },
        {
            name: "deadline",
            type: "uint256"
        }],
    };

    // set the Permit type values
    const values = {
        owner: signer.address,
        spender: spender,
        value: value,
        nonce: nonces,
        deadline: deadline,
    };

    // sign the Permit type data with the deployer's private key
    const signature = await signer.signTypedData(domain, types, values);
    const sig = ethers.Signature.from(signature);

    return {
        v: sig.v,
        r: sig.r,
        s: sig.s,
        deadline
    }
}