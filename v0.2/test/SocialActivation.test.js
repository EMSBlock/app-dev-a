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


describe("SocialActivation Contract", function () {
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
    
        const Contract = await ethers.getContractFactory("SocialActivation");
        const app = await Contract.deploy();
  
      return { app, owner, acc_b, acc_c };
    }

    describe("Deploy Contract", function () {
        it("Should set deployer to authorised user", async function () {
            const { app, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.get_authorised(owner.address)).to.equal(true);
        });
        it("Should set deployer to num_notifications to 1", async function () {
            const { app, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.num_notifications(owner.address)).to.equal(1);
        });
        it("Should set deployer to num_correct_notifications to 1", async function () {
            const { app, owner } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.num_correct_notifications(owner.address)).to.equal(1);
        });
    });

    describe("Authorise New Users", function () {
        it("Should be deployed with only owner being authorised by default", async function () {
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.get_authorised(owner.address)).to.equal(true);
            expect(await app.get_authorised(acc_b.address)).to.equal(false);
            expect(await app.get_authorised(acc_c.address)).to.equal(false);
        });
        it("Should allow authorised users to authorise non-authorised user", async function () {
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.get_authorised(owner.address)).to.equal(true);
            expect(await app.get_authorised(acc_b.address)).to.equal(false);
            await app.connect(owner)._authorise_user(acc_b.address);
            expect(await app.get_authorised(owner.address)).to.equal(true);
            expect(await app.get_authorised(acc_b.address)).to.equal(true);
        });
        it("Should not allow non-authorised user to authorise a non-authorised user", async function () {
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            expect(await app.get_authorised(acc_b.address)).to.equal(false);
            expect(await app.get_authorised(acc_c.address)).to.equal(false);
            await expect(app.connect(acc_b)._authorise_user(acc_b.address, {gasLimit: 1000000})).to.be.revertedWith("Only authorised users can authorise new users");
            expect(await app.get_authorised(acc_b.address)).to.equal(false);
            expect(await app.get_authorised(acc_c.address)).to.equal(false);
        });
    });

    describe("Add New Notification", function () {
        it("Should not allow non-authorised users", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Make new notification with acc_b
            tx = app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("User is not authorised");
        });

        it("Should not allow unknown value for type of disaster", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Get value of threshold defined in smart contract
            threshold = await app.THRESHOLD();
            // Make new notification with acc_b
            tx = app.connect(acc_b)._new_notification(notification_reg.in_regions, threshold+1, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("Not a classified type of disaster (0-5)");
        });

        it("Should not allow value for region outside of boundary", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Get value of threshold defined in smart contract
            max_region = await app.MAX_REGION();
            // Make new notification with acc_b
            tx = app.connect(acc_b)._new_notification([max_region+1, max_region+10], notification_reg.in_type, notification_reg.tx_params);
            // Expect Failure
            await expect(tx).to.be.revertedWith("Region is outside maximum value");
        });

        it("Should be successfull with authorised user, known type of disaster in region boundary", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect Success
            await expect(tx).not.to.be.reverted;
        });

        it("Should update number of notifications by user", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Expect number of notifications to equal 0
            expect(await app.num_notifications(acc_b.address)).to.equal(0);
            // Make new notification with acc_b
            await app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Expect number of notifications to increase to 3
            expect(await app.num_notifications(acc_b.address)).to.equal(notification_reg.in_regions.length);
        });

        it("Should update user saved timestamps", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = await app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Get Timeout value entered + Timeout variable set in smart contract
            timeout = await time.latest() + parseInt(await app.TIMEOUT());
            // Make sure all regions have been given a timestamp
            for (let i = 0; i < notification_reg.in_regions.length; i++) { 
                expect(await app.user_to_timestamp(acc_b.address, notification_reg.in_regions[i], notification_reg.in_type)).to.equal(timeout);
            }
        });

        it("Should update main notification list", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = await app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Get Timeout value entered + Timeout variable set in smart contract
            timeout = await time.latest() + parseInt(await app.TIMEOUT());
            // Make sure all regions have been given a timestamp
            for (let i = 0; i < notification_reg.in_regions.length; i++) { 
                // Zero in following line is position in list inside mapping
                array_temp = await app.region_to_type_count(notification_reg.in_regions[i], notification_reg.in_type, 0);
                expect(array_temp.creator).to.equal(acc_b.address);
                expect(array_temp.times_out).to.equal(timeout);
            }
        });

        it("Should not allow second notification within time frame", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b
            await app.connect(owner)._authorise_user(acc_b.address);
            // Make new notification with acc_b
            tx = await app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Get Timeout value entered + Timeout variable set in smart contract
            timeout = await time.latest() + parseInt(await app.TIMEOUT());
            // This should fail as notification is still active
            await expect(app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params)).to.be.revertedWith("Address already has active notification at this region/type");
            // Time travel to after notification becomes inactive (5 is arbitrary)
            time.increaseTo(timeout+5);
            // This should pass as notification is inactive
            await expect(app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params)).to.not.be.reverted;
        });

        it("Should allow many notifications from unique users in same region", async function () {
            // Deploy Contract
            const { app, owner, acc_b, acc_c } = await loadFixture(fixtureDeployVotingContract);
            // Authorise acc_b and acc_c
            await app.connect(owner)._authorise_user(acc_b.address);
            await app.connect(owner)._authorise_user(acc_c.address);
            // Make new notification with all accounts
            tx_a = app.connect(owner)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            tx_b = app.connect(acc_b)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            tx_c = app.connect(acc_c)._new_notification(notification_reg.in_regions, notification_reg.in_type, notification_reg.tx_params);
            // Execute all tx
            await expect(tx_a).to.not.be.reverted;
            await expect(tx_b).to.not.be.reverted;
            await expect(tx_c).to.not.be.reverted;
        });
    });
});
