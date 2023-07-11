const {time, loadFixture,} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const notification_reg = {
    in_regions: [435, 436, 437],
    in_type: 2,
    tx_params: {
        gasLimit: 1000000
    },
}


describe("Voting Contract", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function fixtureDeployVotingContract() {
  
        // Contracts are deployed using the first signer/account by default
        const [owner, acc_b, acc_c] = await ethers.getSigners();

        // console.log("Account Address'");
        // console.log("Owner: ", owner.address);
        // console.log("Acc_b: ", acc_b.address);
        // console.log("Acc_c: ", acc_c.address);
    
        const Lock = await ethers.getContractFactory("Voting");
        const lock = await Lock.deploy();
  
      return { lock, owner, acc_b, acc_c };
    }

    describe("Deploy Contract", function () {
        it("Should set deployer to authorised user", async function () {
            const { lock, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.get_authorised(owner.address)).to.equal(true);
        });
        it("Should set deployer to num_notifications to 1", async function () {
            const { lock, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.num_notifications(owner.address)).to.equal(1);
        });
        it("Should set deployer to num_correct_notifications to 1", async function () {
            const { lock, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.num_correct_notifications(owner.address)).to.equal(1);
        });
    });

    describe("Authorise New Users", function () {
        it("Should be deployed with only owner being authorised by default", async function () {
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.get_authorised(owner.address)).to.equal(true);
            expect(await lock.get_authorised(acc_b.address)).to.equal(false);
            expect(await lock.get_authorised(acc_c.address)).to.equal(false);
        });
        it("Should allow authorised users to authorise non-authorised user", async function () {
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.get_authorised(owner.address)).to.equal(true);
            expect(await lock.get_authorised(acc_b.address)).to.equal(false);
            await lock.connect(owner)._authorise_user(acc_b.address);
            expect(await lock.get_authorised(owner.address)).to.equal(true);
            expect(await lock.get_authorised(acc_b.address)).to.equal(true);
        });
        it("Should not allow non-authorised user to authorise a non-authorised user", async function () {
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await lock.get_authorised(acc_b.address)).to.equal(false);
            expect(await lock.get_authorised(acc_c.address)).to.equal(false);
            await expect(lock.connect(acc_b)._authorise_user(acc_b.address, {gasLimit: 1000000})).to.be.revertedWith("Only authorised users can authorise new users");
            expect(await lock.get_authorised(acc_b.address)).to.equal(false);
            expect(await lock.get_authorised(acc_c.address)).to.equal(false);
        });
    });

    describe("Add New Notification", function () {
        it("Should not allow non-authorised users", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Make new notification with acc_b
            tx = lock.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("User is not authorised");
        });

        it("Should not allow unknown value for type of disaster", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await lock.connect(owner)._authorise_user(acc_b.address);
            // Get value of threshold defined in smart contract
            threshold = await lock.THRESHOLD();
            // Make new notification with acc_b
            tx = lock.connect(acc_b)._new_notification(notification_reg.in_regions, threshold+1, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("Not a classified type of disaster (0-5)");
        });

        it("Should not allow value for region outside of boundary", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await lock.connect(owner)._authorise_user(acc_b.address);
            // Get value of threshold defined in smart contract
            max_region = await lock.MAX_REGION();
            // Make new notification with acc_b
            tx = lock.connect(acc_b)._new_notification([max_region+1, max_region+10], notification_reg.in_type, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("Region is outside maximum value");
        });

        it("Should be successfull with authorised user, known type of disaster in region boundary", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await lock.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = lock.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect Success
            await expect(tx).not.to.be.reverted;
        });

        it("Should update number of notifications by user", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await lock.connect(owner)._authorise_user(acc_b.address);
            // Expect number of notifications to equal 0
            expect(await lock.num_notifications(acc_b.address)).to.equal(0);
            // Make new notification with acc_b
            await lock.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect number of notifications to increase to 3
            expect(await lock.num_notifications(acc_b.address)).to.equal(notification_reg.in_regions.length);
        });

        it("Should update user saved timestamps", async function () {
            // Deploy Contract
            const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await lock.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = await lock.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Get Timeout value
            timeout = await time.latest() + parseInt(await lock.TIMEOUT());
            // Make sure all regions have been given a timestamp
            for (let i = 0; i < notification_reg.in_regions.length; i++) { 
                expect(await lock.user_to_timestamp(acc_b.address, notification_reg.in_regions[i], notification_reg.in_type)).to.equal(timeout);
            }
        });

        // NOT UPDATED
        // it("Should update main notification list", async function () {
        //     // Deploy Contract
        //     const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
        //     // Authorise acc_b
        //     await lock.connect(owner)._authorise_user(acc_b.address);
        //     // Make new notification with acc_b
        //     await lock.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
        //     console.log(await lock.user_to_timestamp(acc_b.address, notification_reg.in_regions, notification_reg.in_type))
        //     // Expect number of notifications to increase to 3
        //     //expect(await lock.user_to_timestamp(acc_b.address, )).to.equal(notification_reg.in_regions.length);
        // });


        // NOT UPDATED
        // it("Should not allow second notification within time frame", async function () {
        //     // Deploy Contract
        //     const { lock, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
        //     // Authorise acc_b
        //     await lock.connect(owner)._authorise_user(acc_b.address);
        //     // Get value of threshold defined in smart contract
        //     max_region = await lock.MAX_REGION();
        //     // Make new notification with acc_b
        //     tx = lock.connect(acc_b)._new_notification([max_region+1, max_region+10], notification_reg.in_type, notification_reg.tx_params);
        //     // Expect Failure
        //     await expect(tx).to.be.revertedWith("Region is outside maximum value");
        // });


    });
});



// it("Should set the right owner", async function () {
//   const { lock, owner } = await loadFixture(deployOneYearLockFixture);

//   expect(await lock.owner()).to.equal(owner.address);
// });

// it("Should receive and store the funds to lock", async function () {
//   const { lock, lockedAmount } = await loadFixture(
//     deployOneYearLockFixture
//   );

//   expect(await ethers.provider.getBalance(lock.address)).to.equal(
//     lockedAmount
//   );
// });

// it("Should fail if the unlockTime is not in the future", async function () {
//   // We don't use the fixture here because we want a different deployment
//   const latestTime = await time.latest();
//   const Lock = await ethers.getContractFactory("Lock");
//   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
//     "Unlock time should be in the future"
//   );
// });


//   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//   const ONE_GWEI = 1_000_000_000;

//   const lockedAmount = ONE_GWEI;
//   const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;