import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { networkConfig } from '../common/config';

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

    // deploy an erc20
    const ERC20 = await hre.ethers.getContractFactory('TestToken');
    const erc20 = await ERC20.deploy(hre.ethers.parseEther('1000'));
    const erc20Address = await erc20.getAddress();

    return {
      forwarder,
      forwarderAddress,
      owner,
      forwardTo,
      erc20,
      erc20Address,
    };
  }

  describe('Deployment', function () {
    it('Should set the right forwardTo', async function () {
      const { forwarder, forwardTo } = await loadFixture(deployFixture);

      expect(await forwarder.forwardTo()).to.equal(forwardTo.address);
    });
  });


  describe('Flush erc20', function () {
    it('Should transfer the funds to the forwardTo address no matter the sender', async function () {
      const {
        forwarder,
        forwarderAddress,
        owner,
        forwardTo,
        erc20,
        erc20Address,
      } = await loadFixture(deployFixture);

      // send some erc20 to the forwarder
      await erc20
        .connect(owner)
        .transfer(forwarderAddress, hre.ethers.parseEther('1.0'));

      // forward the funds
      await forwarder.connect(owner).flushToken(erc20Address);

      // check the balances
      expect(await erc20.balanceOf(forwardTo.address)).to.equal(
        hre.ethers.parseEther('1.0'),
      );
      expect(await erc20.balanceOf(forwarderAddress)).to.equal(0);
    });

    it('Should emit a Flush event', async function () {
      const {
        forwarder,
        forwarderAddress,
        owner,
        forwardTo,
        erc20,
        erc20Address,
      } = await loadFixture(deployFixture);

      // send some erc20 to the forwarder
      await erc20
        .connect(owner)
        .transfer(forwarderAddress, hre.ethers.parseEther('1.0'));

      // forward the funds
      await forwarder.connect(owner).flushToken(erc20Address);

      // check the event
      const events = await forwarder.queryFilter(
        forwarder.filters[
          'ForwarderFlushed(address,uint256)'
        ](),
      );
      expect(events).to.have.lengthOf(1);
      expect(events[0].args[0]).to.equal(erc20Address);
      expect(events[0].args[1]).to.equal(hre.ethers.parseEther('1.0'));
    });
  });

  describe("Flush with native", function () {
    // TODO:
  })

  describe("Native flush", function () {
    it("Native should be automatically flushed", async function () {
      const { forwarderAddress, owner, forwardTo } = await loadFixture(deployFixture);
      const balanceBefore = await hre.ethers.provider.getBalance(forwardTo);

      await owner.sendTransaction({
        to: forwarderAddress,
        value: hre.ethers.parseEther('1.0'),
      });
      
      const balanceAfter = await hre.ethers.provider.getBalance(forwardTo);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })
  })

});