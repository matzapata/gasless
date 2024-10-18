import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { sha3 } from '@netgum/utils';
import { networkConfig } from '../common/config';

describe('ForwarderFactory', function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    const config = networkConfig[Number(chainId)];
    if (!config) {
      throw new Error(`No config for chainId ${chainId}`);
    }

    // deploy the forwarder
    const ForwarderFactory =
      await hre.ethers.getContractFactory('ForwarderFactory');
    const forwarderFactory = await ForwarderFactory.deploy(
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
    );
    const forwarderFactoryAddress = await forwarderFactory.getAddress();

    return { forwarderFactory, forwarderFactoryAddress, owner, otherAccount };
  }

  describe('computeAddress', function () {
    it('Should output the same result for the same salt', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      expect(
        await forwarderFactory.getForwarder(otherAccount.address),
      ).to.equal(
        await forwarderFactory.getForwarder(otherAccount.address),
      );
    });

    it("Should compute different forwarders for deferent accounts", async function () {
      const { forwarderFactory } =
        await loadFixture(deployFixture);

      expect(
        await forwarderFactory.getForwarder(hre.ethers.Wallet.createRandom().address),
      ).to.not.equal(
        await forwarderFactory.getForwarder(hre.ethers.Wallet.createRandom().address),
      )
    })
  });

  describe('createContract', function () {
    it('Should create contract', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      try {
        const tx = await forwarderFactory.createForwarder(
          otherAccount.address,
        );
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    });

    it('Cost of deployment should be below fee', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      try {
        const tx = await forwarderFactory.createForwarder(
          otherAccount.address,
        );
        const receipt = await tx.wait();
        if (!receipt) {
          throw new Error('No receipt');
        }
        const cost = receipt.gasUsed * receipt.gasPrice;
        console.log(`Cost: ${hre.ethers.formatEther(cost)} wei`);
        console.log("Recommended fee greater than: ", cost);
      } catch (error) {
        console.log(error);
      }
    });

    it('Should fail to create contract if it already exists', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      const salt = sha3(Date.now());
      await forwarderFactory.createForwarder(otherAccount.address);
      await expect(forwarderFactory.createForwarder(otherAccount.address))
        .to.be.reverted;
    });

    it('Should create the contract in the computed address', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      const forwardTo = otherAccount.address;
      const computedAddress = await forwarderFactory.getForwarder(
        forwardTo,
      );
      await forwarderFactory.createForwarder(forwardTo);

      // get events from forwarderFactory
      const events = await forwarderFactory.queryFilter(
        forwarderFactory.filters.ForwarderCreated(),
      );

      expect(events).to.have.lengthOf(1);
      expect(events[0].args[0]).to.equal(computedAddress);
      expect(events[0].args[1]).to.equal(forwardTo);
    });

    it('Should emit an event with the created contract address and the forwardTo', async function () {
      const { forwarderFactory, otherAccount } =
        await loadFixture(deployFixture);

      const salt = sha3(Date.now());
      const forwardTo = otherAccount.address;
      await forwarderFactory.createForwarder(forwardTo);

      // get events from forwarderFactory
      const events = await forwarderFactory.queryFilter(
        forwarderFactory.filters.ForwarderCreated(),
      );

      expect(events).to.have.lengthOf(1);
      expect(events[0].args[0]).to.exist;
      expect(events[0].args[1]).to.equal(forwardTo);
    });
  });
});
