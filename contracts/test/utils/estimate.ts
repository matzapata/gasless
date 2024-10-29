
export async function estimateTxGas(label: string,  tx: any) {
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('No receipt');
    }

    console.log(`${label} gas used: ${receipt.gasUsed.toString()}`);
}