import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { whileImpersonating } from "./utils/impersonating";
import { getPermitSignature } from "./utils/permit";
import { networkConfig } from "../common/config";

describe("GasStation", function () {
  async function deployMainnetForkFixture() {
    const [owner, relayer, user] = await hre.ethers.getSigners();

    const chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    const config = networkConfig[Number(chainId)];

    if (!config) {
      throw new Error(`No config for chainId ${chainId}`);
    }

    const WHALE_TOKEN = config.TOKENS.find((t) => t.address === config.WHALE_TOKEN);
    const OTHER = config.TOKENS.find((t) => t.address !== config.WHALE_TOKEN);
    if (!WHALE_TOKEN || !OTHER) {
      throw new Error(`Missing WHALE_TOKEN or OTHER token`);
    }

    const GasStation = await hre.ethers.getContractFactory("GasStation");
    const gasStation = await GasStation.deploy();
    await gasStation.initialize(
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      [WHALE_TOKEN.address],
      config.RElAYER_FEE,
      config.SWAP_FEE
    );

    // fund with USDC
    await whileImpersonating(hre, config.WHALE, async (signer) => {
      const usdc = await hre.ethers.getContractAt("IERC20", WHALE_TOKEN.address, signer);
      await usdc.transfer(user, "1000000000");
    })

    return { gasStation, owner, relayer, user, config, WHALE_TOKEN, OTHER };
  }

  describe("Deployment", function () {
    it("Should set the right fee", async function () {
      const { gasStation, config } = await loadFixture(deployMainnetForkFixture);

      expect(await gasStation.getRelayerFee()).to.equal(config.RElAYER_FEE);
    });

    it("Should set the right owner", async function () {
      const { gasStation, owner } = await loadFixture(deployMainnetForkFixture);

      expect(await gasStation.owner()).to.equal(owner.address);
    });
  });

  describe("swapForEth", function () {
    it("Should swap whitelisted token for eth using permit", async () => {
      const { gasStation, user, relayer, config, WHALE_TOKEN } = await loadFixture(deployMainnetForkFixture);
      const gasStationAddress = await gasStation.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.RElAYER_FEE;
      const token = WHALE_TOKEN.address;


      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        gasStationAddress,
        amount,
      )

      // balances before swap
      const userEthBalanceBefore = await hre.ethers.provider.getBalance(user.address)
      const relayerEthBalanceBefore = await hre.ethers.provider.getBalance(relayer.address)

      // swap for eth
      const tx = await gasStation.connect(relayer).swapForEth(
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
      const { gasStation, user, relayer, config, WHALE_TOKEN } = await loadFixture(deployMainnetForkFixture);
      const gasStationAddress = await gasStation.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.RElAYER_FEE;

      // remove token from whitelist
      await expect(gasStation.whitelistToken(WHALE_TOKEN.address, false)).to.not.be.reverted

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        WHALE_TOKEN.address,
        gasStationAddress,
        amount,
      )

      await expect(gasStation.connect(relayer).swapForEth(
        user.address,
        WHALE_TOKEN.address,
        amount,
        relayerMinFee,
        deadline,
        v,
        r,
        s
      )).to.be.revertedWith("Token not whitelisted")
    })

    it("Should revert if fee doesn't match min fee by relayer", async () => {
      const { gasStation, user, relayer, config, WHALE_TOKEN } = await loadFixture(deployMainnetForkFixture);
      const gasStationAddress = await gasStation.getAddress()
      const amount = BigInt("10000000")
      const relayerMinFee = config.RElAYER_FEE * BigInt(2);
      const token = WHALE_TOKEN.address

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        gasStationAddress,
        amount,
      )

      await expect(gasStation.connect(relayer).swapForEth(
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
      const { gasStation, user, relayer, config, WHALE_TOKEN } = await loadFixture(deployMainnetForkFixture);
      const gasStationAddress = await gasStation.getAddress()
      const relayerMinFee = config.RElAYER_FEE;
      const token = WHALE_TOKEN.address;
      const amount = BigInt("100") // lower than relayer fee

      // permit contract to withdraw token
      const { v, r, s, deadline } = await getPermitSignature(
        user,
        token,
        gasStationAddress,
        amount,
      )

      await expect(gasStation.connect(relayer).swapForEth(
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
      const { gasStation, relayer, WHALE_TOKEN } = await loadFixture(deployMainnetForkFixture);
      const amount = BigInt("1000000000")
      const token = WHALE_TOKEN.address;

      const [amountOut, relayerFee] = await gasStation.connect(relayer).quoteSwapForEth(
        token,
        amount,
      )

      expect(amountOut).to.be.greaterThan(0)
      expect(relayerFee).to.be.greaterThan(0)
    })
  })
});


