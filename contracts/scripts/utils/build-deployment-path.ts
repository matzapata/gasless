import path from "path"

export function buildDeploymentPath(chainId: number, contractName: string) {
    return path.join(__dirname, `../../deployments/${chainId}/${contractName}.json`)
}