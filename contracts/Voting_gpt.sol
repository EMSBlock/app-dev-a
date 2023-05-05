// SPDX-License-Identifier: UNLICENSED
// Voting contract built by chat gpt
pragma solidity ^0.8.0;

contract EventConsensus {
    uint public consensusThreshold;
    uint public notificationsCount;
    mapping (address => bool) public hasVoted;
    mapping (uint => Notification) public notifications;
    
    struct Notification {
        address user;
        string message;
        uint votes;
        bool consensusReached;
    }

    event NewNotification(address user, string message);
    event ConsensusReached(uint notificationId);

    constructor(uint _consensusThreshold) {
        consensusThreshold = _consensusThreshold;
    }

    function addNotification(string memory message) public {
        require(bytes(message).length > 0, "Message cannot be empty");

        Notification memory newNotification = Notification({
            user: msg.sender,
            message: message,
            votes: 0,
            consensusReached: false
        });

        uint notificationId = notificationsCount;
        notifications[notificationId] = newNotification;
        notificationsCount++;

        emit NewNotification(msg.sender, message);

        checkConsensus(notificationId);
    }

    function vote(uint notificationId) public {
        require(notificationId < notificationsCount, "Invalid notification id");
        require(!hasVoted[msg.sender], "You have already voted");

        Notification storage notification = notifications[notificationId];
        require(!notification.consensusReached, "Consensus already reached for this notification");

        notification.votes++;
        hasVoted[msg.sender] = true;

        emit ConsensusReached(notificationId);

        checkConsensus(notificationId);
    }

    function checkConsensus(uint notificationId) private {
        Notification storage notification = notifications[notificationId];
        if (notification.votes >= consensusThreshold) {
            notification.consensusReached = true;
        }
    }
}
