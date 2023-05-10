// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// console.log command
// import "../../../libraries/contract/hardhat/console.sol";

/*
* @title Voting Contract
* @author 0x365
* @dev
*/

contract Voting {

    uint public vote_threshold;
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

    constructor(uint _vote_threshold) {
        /*
        * @notice When deploying contract set the vote threshold
        * @param (uint) Vote threshold to set for contract
        */
        require(_vote_threshold > 0, "Threshold must be more than zero");
        vote_threshold = _vote_threshold;
    }

    function add_notification(string memory message) public {
        /*
        * @notice Creates a new notification
        * @param 
        */
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

    // Maybe dont need this
    function get_notification(uint _notification_id) view public returns(Notification memory return_notification) {
        /*
        * @notice Gets the notification of the notification id input
        * @param Notification Id
        * @returns Notification information
        */
        require(_notification_id < notificationsCount, "Notification id doesnt exist");
        return notifications[_notification_id];
    }

    function vote(uint notificationId) public {
        /*
        * @notice Vote on a notification
        * @param 
        */
        require(notificationId < notificationsCount, "Invalid notification id");
        //require(!hasVoted[msg.sender], "You have already voted");

        Notification storage notification = notifications[notificationId];
        //require(!notification.consensusReached, "Consensus already reached for this notification");

        notification.votes++;
        hasVoted[msg.sender] = true;

        emit ConsensusReached(notificationId);

        checkConsensus(notificationId);
    }

    function checkConsensus(uint notificationId) private {
        /*
        * @notice Check if voting threshold has been reached on a notification
        * @param
        */
        Notification storage notification = notifications[notificationId];
        if (notification.votes >= vote_threshold) {
            notification.consensusReached = true;
        }
    }

}