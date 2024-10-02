import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { whileImpersonating } from "./utils/impersonating";
import { getPermitSignature } from "./utils/permit";
import { networkConfig } from "../common/config";

describe("ThisForThat", function () {
  async function deployMainnetForkFixture() {
    const [owner, relayer, user] = await hre.ethers.getSigners();

    const chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    const config = networkConfig[Number(chainId)];

    if (!config) {
      throw new Error(`No config for chainId ${chainId}`);
    }

    const ThisForThat = await hre.ethers.getContractFactory("ThisForThat");
    const thisForThat = await ThisForThat.deploy(
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      [config.TOKENS.USDC],
      config.FEE
    );

    // fund with USDC
    await whileImpersonating(hre, config.WHALE, async (signer) => {
      const usdc = await hre.ethers.getContractAt("IERC20", config.TOKENS.USDC, signer);
      await usdc.transfer(user, "1000000000");
    })

    return { thisForThat, owner, relayer, user, config };
  }

  describe("Deployment", function () {
    it("Should set the right fee", async function () {
      const { thisForThat, config } = await loadFixture(deployMainnetForkFixture);

      expect(await thisForThat.RELAYER_FEE()).to.equal(config.FEE);
    });

    it("Should set the right owner", async function () {
      const { thisForThat, owner } = await loadFixture(deployMainnetForkFixture);

      expect(await thisForThat.owner()).to.equal(owner.address);
    });
  });

  describe("swapForEth", function () {
    it("Should swap whitelisted token for eth using permit", async () => {
      const { thisForThat, user, relayer, config } = await loadFixture(deployMainnetForkFixture);
      const thisForThatAddress = await thisForThat.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.FEE;
      const token = config.TOKENS.USDC;


      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        thisForThatAddress,
        amount,
      )

      // balances before swap
      const userEthBalanceBefore = await hre.ethers.provider.getBalance(user.address)
      const relayerEthBalanceBefore = await hre.ethers.provider.getBalance(relayer.address)

      // swap for eth
      const tx = await thisForThat.connect(relayer).swapForEth(
        user.address,
        token,
        amount,
        relayerMinFee,
        deadline,
        v,
        r,
        s
      )
      const rec = await tx.wait()
      const txCostEth = BigInt(rec?.gasUsed ?? 0) * BigInt(rec?.gasPrice ?? 0)

      // user should receive eth
      const userEthBalanceAfter = await hre.ethers.provider.getBalance(user.address)
      expect(userEthBalanceAfter - userEthBalanceBefore).to.be.greaterThan(0)

      // relayer should receive fee
      const relayerEthBalanceAfter = await hre.ethers.provider.getBalance(relayer.address)
      expect(relayerEthBalanceAfter - relayerEthBalanceBefore + txCostEth).to.be.eq(relayerMinFee)
    })

    it("Should revert if token is not whitelisted", async () => {
      const { thisForThat, user, relayer, config } = await loadFixture(deployMainnetForkFixture);
      const thisForThatAddress = await thisForThat.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.FEE;
      const token = config.TOKENS.OTHER;

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        thisForThatAddress,
        amount,
      )

      await expect(thisForThat.connect(relayer).swapForEth(
        user.address,
        token,
        amount,
        relayerMinFee,
        deadline,
        v,
        r,
        s
      )).to.be.revertedWith("Token not whitelisted")
    })

    it("Should revert if fee doesn't match min fee by relayer", async () => {
      const { thisForThat, user, relayer, config } = await loadFixture(deployMainnetForkFixture);
      const thisForThatAddress = await thisForThat.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.FEE * BigInt(2);
      const token = config.TOKENS.USDC

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        thisForThatAddress,
        amount,
      )

      await expect(thisForThat.connect(relayer).swapForEth(
        user.address,
        token,
        amount,
        relayerMinFee,
        deadline,
        v,
        r,
        s
      )).to.be.revertedWith("Relayer fee too high")
    })

    it("Should revert if after swap there're not enough funds for relayer fee", async () => {
      const { thisForThat, user, relayer, config } = await loadFixture(deployMainnetForkFixture);
      const thisForThatAddress = await thisForThat.getAddress()
      const amount = BigInt("100")
      const relayerMinFee = config.FEE;
      const token = config.TOKENS.USDC;

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        thisForThatAddress,
        amount,
      )

      await expect(thisForThat.connect(relayer).swapForEth(
        user.address,
        token,
        amount,
        relayerMinFee,
        deadline,
        v,
        r,
        s
      )).to.be.revertedWith("Not enough ETH to pay relayer fee")
    })
  });

  describe("quoteSwapForEth", function () {
    it("Should quote swap for eth", async () => {
      const { thisForThat, config } = await loadFixture(deployMainnetForkFixture);

      const [amountOut, relayerFee] = await thisForThat.quoteSwapForEth(config.TOKENS.USDC, 10000000);

      expect(amountOut).to.be.greaterThan(0)
      expect(relayerFee).to.be.greaterThan(0)
    })
  })
});


