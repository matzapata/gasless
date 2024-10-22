import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { networkConfig } from '../common/config';
import { whileImpersonating } from './utils/impersonating';
import { authorizeFlush } from './utils/flush-auth';

describe('Forwarder', function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, forwardTo] = await hre.ethers.getSigners();

    const chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    const config = networkConfig[Number(chainId)];
    if (!config) {
      throw new Error(`No config for chainId ${chainId}`);
    }

    // deploy the forwarder
    const Forwarder = await hre.ethers.getContractFactory('Forwarder');
    const forwarder = await Forwarder.deploy();
    const forwarderAddress = await forwarder.getAddress();
    await forwarder.initialize(
      forwardTo.address,
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
    )

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

      expect(await forwarder.getForwardTo()).to.equal(forwardTo.address);
    });
  });

  describe("Flush with native", function () {
    it("Should flush with native when called by relayer with auth signature", async function () {
      const { forwarder, forwardTo, config, whaleToken } = await loadFixture(deployFixture);

      const ethBalanceBefore = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceBefore = await whaleToken.balanceOf(forwardTo.address);

      const flushParams = {
        token: await whaleToken.getAddress(),
        amount: 10000000n,
        amountOutMinimum: 1000000n / 97n * 100n,
        swapFee: 3000n, // 3000 bps = 0.3%
        swapDeadline: BigInt(Date.now() + 1000 * 60 * 60 * 24),
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }
      const flushAuth = await authorizeFlush(
        forwardTo,
        await forwarder.getAddress(),
        flushParams
      )

      await expect(
        forwarder.flushTokenWithNative(
          flushParams,
          flushAuth
        )
      ).not.to.be.reverted;

      const ethBalanceAfter = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceAfter = await whaleToken.balanceOf(forwardTo.address);

      expect(ethBalanceAfter).to.be.greaterThan(ethBalanceBefore);
      expect(tokenBalanceAfter).to.be.equal(tokenBalanceBefore + BigInt("10000000"));
    })

    it("Should flush with native when called by forwardTo without auth signature", async function () {
      const { forwarder, forwardTo, config, whaleToken } = await loadFixture(deployFixture);

      const ethBalanceBefore = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceBefore = await whaleToken.balanceOf(forwardTo.address);

      const flushParams = {
        token: await whaleToken.getAddress(),
        amount: 10000000n,
        amountOutMinimum: 1000000n / 97n * 100n,
        swapFee: 3000n, // 3000 bps = 0.3%
        swapDeadline: BigInt(Date.now() + 1000 * 60 * 60 * 24),
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }

      await expect(
        forwarder.connect(forwardTo).flushTokenWithNative(
          flushParams,
          "0x"
        )
      ).not.to.be.reverted;

      const ethBalanceAfter = await hre.ethers.provider.getBalance(forwardTo.address);
      const tokenBalanceAfter = await whaleToken.balanceOf(forwardTo.address);

      expect(ethBalanceAfter).to.be.greaterThan(ethBalanceBefore);
      expect(tokenBalanceAfter).to.be.equal(tokenBalanceBefore + BigInt("10000000"));
    })

    it("Should not flush with native when called by other without auth signature", async function () {
      const { forwarder, config, whaleToken, owner } = await loadFixture(deployFixture);

      const flushParams = {
        token: await whaleToken.getAddress(),
        amount: 10000000n,
        amountOutMinimum: 1000000n / 97n * 100n,
        swapFee: 3000n, // 3000 bps = 0.3%
        swapDeadline: BigInt(Date.now() + 1000 * 60 * 60 * 24),
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }

      expect(owner.address).not.to.equal(await forwarder.getForwardTo());
      await expect(
        forwarder.connect(owner).flushTokenWithNative(
          flushParams,
          "0x"
        )
      ).to.be.reverted;
    })
  })

  describe("Native flush", function () {
    it("Should flush native to forwardTo when called by forwarder with auth signature", async function () {
      const { forwarder, forwarderAddress, owner, forwardTo, config } = await loadFixture(deployFixture);
      const balanceBefore = await hre.ethers.provider.getBalance(forwardTo);

      await owner.sendTransaction({
        to: forwarderAddress,
        value: hre.ethers.parseEther('2.0'),
      });

      const flushParams = {
        token: ethers.ZeroAddress,
        amount: 10000000n,
        amountOutMinimum: 10000000n,
        swapFee: 0n, 
        swapDeadline: 0n,
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }
      const flushAuth = await authorizeFlush(
        forwardTo,
        await forwarder.getAddress(),
        flushParams
      )

      await expect(
        forwarder.flushNative(
          flushParams,
          flushAuth
        )
      ).not.to.be.reverted;

      const balanceAfter = await hre.ethers.provider.getBalance(forwardTo);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })

    it("Should flush native to forwardTo when called by forwardTo without auth signature", async function () {
      const { forwarder, forwarderAddress, owner, forwardTo, config } = await loadFixture(deployFixture);
      const balanceBefore = await hre.ethers.provider.getBalance(forwardTo);

      await owner.sendTransaction({
        to: forwarderAddress,
        value: hre.ethers.parseEther('2.0'),
      });

      const flushParams = {
        token: ethers.ZeroAddress,
        amount: 10000000n,
        amountOutMinimum: 10000000n,
        swapFee: 0n, 
        swapDeadline: 0n,
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }
      
      await expect(
        forwarder.connect(forwardTo).flushNative(
          flushParams,
          "0x"
        )
      ).not.to.be.reverted;

      const balanceAfter = await hre.ethers.provider.getBalance(forwardTo);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })

    it("Should not flush native to forwardTo when called by other without auth signature", async function () {
      const { forwarder, forwarderAddress, owner, config } = await loadFixture(deployFixture);

      await owner.sendTransaction({
        to: forwarderAddress,
        value: hre.ethers.parseEther('2.0'),
      });

      const flushParams = {
        token: ethers.ZeroAddress,
        amount: 10000000n,
        amountOutMinimum: 10000000n,
        swapFee: 0n, 
        swapDeadline: 0n,
        sqrtPriceLimitX96: 0n,
        relayerFee: config.RElAYER_FEE
      }
      
      expect(owner.address).not.to.equal(await forwarder.getForwardTo());
      await expect(
        forwarder.connect(owner).flushNative(
          flushParams,
          "0x"
        )
      ).to.be.reverted;
    })
  })
});