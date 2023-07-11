const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventConsensus", function () {
    let EventConsensus;
    let eventConsensus;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        EventConsensus = await ethers.getContractFactory("EventConsensus");
        eventConsensus = await EventConsensus.deploy(2);
        await eventConsensus.deployed();
    });

    it("should add a new notification", async function () {
        const message = "New notification";
        await eventConsensus.addNotification(message);
        const notification = await eventConsensus.notifications(0);
        expect(notification.user).to.equal(owner.address);
        expect(notification.message).to.equal(message);
        expect(notification.votes).to.equal(0);
        expect(notification.consensusReached).to.equal(false);
    });

    it("should not add a new notification with empty message", async function () {
        await expect(eventConsensus.addNotification("")).to.be.revertedWith(
            "Message cannot be empty"
        );
    });

    it("should reach consensus on a notification", async function () {
        const message = "Notification with consensus";
        await eventConsensus.addNotification(message);

        await eventConsensus.connect(addr1).vote(0);
        let notification = await eventConsensus.notifications(0);
        expect(notification.votes).to.equal(1);
        expect(notification.consensusReached).to.equal(false);

        await eventConsensus.connect(addr2).vote(0);
        notification = await eventConsensus.notifications(0);
        expect(notification.votes).to.equal(2);
        expect(notification.consensusReached).to.equal(true);
    });

    it("should not allow a user to vote more than once", async function () {
        const message = "Notification with duplicate vote";
        await eventConsensus.addNotification(message);

        await eventConsensus.connect(addr1).vote(0);
        await expect(eventConsensus.connect(addr1).vote(0)).to.be.revertedWith(
            "You have already voted"
        );
    });

    it("should not allow voting on an invalid notification id", async function () {
        await expect(eventConsensus.vote(1)).to.be.revertedWith(
            "Invalid notification id"
        );
    });

    it("should not allow voting on a notification with consensus reached", async function () {
        const message = "Notification with consensus";
        await eventConsensus.addNotification(message);

        await eventConsensus.connect(addr1).vote(0);
        await eventConsensus.connect(addr2).vote(0);
        await expect(eventConsensus.connect(owner).vote(0)).to.be.revertedWith(
            "Consensus already reached for this notification"
        );
    });
});