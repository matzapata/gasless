

export function shortenAddress(address: string, size = 10): string {
    return `${address.slice(0, size)}...${address.slice(-size)}`
}