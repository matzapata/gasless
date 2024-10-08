import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { networkConfig } from '../common/config';
import { whileImpersonating } from './utils/impersonating';

describe('Forwarder', function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, forwardTo] = await hre.ethers.getSigners();

    const chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    const config = networkConfig[Number(chainId)];
    if (!config) {
      throw new Error(`No config for chainId ${chainId}`);
    }

    // deploy the gas station
    const GasStation = await hre.ethers.getContractFactory("GasStation");
    const gasStation = await GasStation.deploy(
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      [],
      config.RElAYER_FEE,
      config.SWAP_FEE
    );

    // deploy the forwarder
    const Forwarder = await hre.ethers.getContractFactory('Forwarder');
    const forwarder = await Forwarder.deploy(
      await gasStation.getAddress(),
      config.UNISWAP_WETH,
      config.UNISWAP_ROUTER,
      forwardTo.address
    );
    const forwarderAddress = await forwarder.getAddress();

    // fund with USDC
    const whaleToken = await hre.ethers.getContractAt("IERC20", config.WHALE_TOKEN);
    await whileImpersonating(hre, config.WHALE, async (signer) => {
      await whaleToken.connect(signer).transfer(forwarderAddress, "1000000000");
    })


    return {
      forwarder,
      forwarderAddress,
      owner,
      forwardTo,
      config,
      whaleToken
    };
  }

  describe('Deployment', function () {
    it('Should set the right forwardTo', async function () {
      const { forwarder, forwardTo } = await loadFixture(deployFixture);

      expect(await forwarder.forwardTo()).to.equal(forwardTo.address);
    });
  });

  describe("Flush with native", function () {
    it("Should flush with native", async function () {
      const { forwarder, forwardTo, config, whaleToken } = await loadFixture(deployFixture);

      const ethBalanceBefore = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceBefore = await whaleToken.balanceOf(forwardTo.address);

      await expect(forwarder.flushTokenWithNative(await whaleToken.getAddress(), "10000000", 0))
        .not.to.be.reverted;

      const ethBalanceAfter = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceAfter = await whaleToken.balanceOf(forwardTo.address);

      expect(ethBalanceAfter).to.be.greaterThan(ethBalanceBefore);
      expect(tokenBalanceAfter).to.be.equal(tokenBalanceBefore + BigInt("10000000"));
    })
  })

  describe("Native flush", function () {
    it("Should flush native to forwardTo", async function () {
      const { forwarder, forwarderAddress, owner, forwardTo } = await loadFixture(deployFixture);
      const balanceBefore = await hre.ethers.provider.getBalance(forwardTo);

      await owner.sendTransaction({
        to: forwarderAddress,
        value: hre.ethers.parseEther('1.0'),
      });

      await forwarder.flushNative(hre.ethers.parseEther('1.0'));

      const balanceAfter = await hre.ethers.provider.getBalance(forwardTo);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })
  })

});