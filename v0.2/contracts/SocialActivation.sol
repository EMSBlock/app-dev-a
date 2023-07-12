// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// console.log command
import "../contract-lib/hardhat/console.sol";

// NOTES
// Inherint property (If many fake notifications given for certain locations the computational cost will increase for region)

contract SocialActivation {

    // Minimum number of votes required for consensus to be reached
    uint256 public THRESHOLD = 10000;
    // Max time after creation that notification is considered active
    uint256 public TIMEOUT = 10;
    // Max number of regions available (Currently 1 degree lat lon)
    uint256 public MAX_REGION = 360 * 180;
    // Number of types of disasters
    uint8 public NUM_DISASTER_TYPES = 5;    // One more than given as 0 also allowed
    // Counter for number of confirmed disasters
    uint256 public num_disasters;


    // Disaster Notification
    struct Notification {
        address creator;
        uint times_out;
    }

    // Confirmed Disaster
    struct Disaster {
        uint disaster_type;
        uint region;
        uint time_of_first_notification;
        uint time_of_consensus;
    }


    // Map user to authorised or not
    mapping (address => bool) public get_authorised;

    // Notifications made
    mapping (address => uint) public num_notifications;

    // Notifications part of consensus
    mapping (address => uint) public num_correct_notifications;

    // Map region to type list containing current count
    //mapping (uint => Notification[][]) public region_to_type_count;
    mapping (uint => mapping (uint => Notification[])) public region_to_type_count;
    //mapping (uint => mapping (uint => mapping (address => uint) ) ) public region_to_type_count;

    // Map user to notification locations
    // User to region to type to timestamp
    mapping (address => mapping (uint => mapping (uint => uint) ) ) public user_to_timestamp;

    // Map disaster id to disaster
    mapping (uint => Disaster) public disasters_confirmed;

    
    // On deploy constructor
    // Could add address as input to create the first authorised user
    constructor() {
        get_authorised[msg.sender] = true;
        num_notifications[msg.sender] = 1;
        num_correct_notifications[msg.sender] = 1;
    }

    
    function _authorise_user(address _new_address) public {
        require(get_authorised[msg.sender] == true, "Only authorised users can authorise new users");
        get_authorised[_new_address] = true;
        num_notifications[_new_address] = 0;
        num_correct_notifications[_new_address] = 0;
    }


    // (PUBLIC) creates new notification, including validating that notification is allowed to be given by user
    function _new_notification(uint[] memory _regions, uint _disaster_type) public {
        console.log("##### Testing checkpoint 0");
        require(get_authorised[msg.sender] == true, "User is not authorised");
        require(_disaster_type <= NUM_DISASTER_TYPES, "Not a classified type of disaster (0-5)");
        console.log("##### Testing checkpoint 1");
        Notification memory notification = Notification({
            creator: msg.sender,
            times_out: block.timestamp + TIMEOUT
            // Could add stake amount too
        });
        console.log("##### Testing checkpoint 2");
        // Increment how many notifications a user has made
        num_notifications[msg.sender] += _regions.length;
        console.log("##### Testing checkpoint 3");
        // Checks if user has active notification in region/type and if not adds new notification
        for (uint i = 0; i < _regions.length; i++) {
            console.log("##### Testing checkpoint 4");
            require(_check_active_notification(_regions[i], _disaster_type), "Address already has active notification at this region/type");
            console.log("##### Testing checkpoint 5");
            user_to_timestamp[msg.sender][_regions[i]][_disaster_type] = block.timestamp + TIMEOUT;
            region_to_type_count[_regions[i]][_disaster_type].push(notification);
        }
        console.log("##### Testing checkpoint Complete");
    }


    // (PUBLIC VIEW) checks if the user already has an active notification at this region
    function _check_active_notification(uint _region, uint _disaster_type) public view returns (bool) {
        require(_region <= MAX_REGION, "Region is outside maximum value");
        console.log("##### Testing checkpoint 4");
        return (user_to_timestamp[msg.sender][_region][_disaster_type] < block.timestamp);
    }


    // (PUBLIC VIEW) Counts total reputation of all active notifications in the input region
    function _count_region(uint _region, uint _disaster_type) public view returns (uint count) {
        require(_region <= MAX_REGION);
        require(_disaster_type <= NUM_DISASTER_TYPES);
        count = 0;
        Notification[] memory current_region = region_to_type_count[_region][_disaster_type];
        for (uint i = 0; i < current_region.length; i++) {
            if (current_region[i].times_out > block.timestamp) {
                count += _get_rep(current_region[i].creator);
            }
        }
        return count;
    }
    

    // (PUBLIC) Checks if consensus exists in given region and type and creates disaster_confirmed value
    function _confirm_consensus(uint _region, uint _disaster_type) public {
        uint count = _count_region(_region, _disaster_type);
        require(count >= THRESHOLD, "Consensus has not been reached");
        uint first_notification;
        // Update correct notifications count
        Notification[] memory current_region = region_to_type_count[_region][_disaster_type];
        for (uint i = 0; i < current_region.length; i++) {
            if (current_region[i].times_out > block.timestamp) {
                num_correct_notifications[current_region[i].creator]++;
                if (current_region[i].times_out < first_notification) {
                    first_notification = current_region[i].times_out;
                }
            }
        }
        // Creates confirmed disaster
        num_disasters++;
        disasters_confirmed[num_disasters] = Disaster({
            disaster_type: _disaster_type,
            region: _region,
            time_of_first_notification: first_notification - THRESHOLD,
            time_of_consensus: block.timestamp
        });

        // Remove all notifications for that region and disaster type after consensus found
        delete region_to_type_count[_region][_disaster_type];

        // Maybe incentivise by giving 10% stake to msg.sender at this point
    }


    // (PUBLIC) Get reputation (THIS NEEDS MODIFIED AS CURRENTLY VERY SIMPLE)
    function _get_rep(address _address_to_update) public view returns (uint) {
        // Can use number of correct notifications and number of total notifications
        return num_correct_notifications[_address_to_update];// / num_notifications[_address_to_update];
    }
}