// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// console.log command
import "../contract-lib/hardhat/console.sol";

// NOTES
// Inherint property (If many fake notifications given for certain locations the computational cost will increase for region)

contract NewVoting {

    // Minimum number of votes required for consensus to be reached
    uint256 public THRESHOLD = 10000;
    // Max time after creation that notification is considered active
    uint256 public TIMEOUT = 100000;
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
    mapping (uint => Notification[][]) public region_to_type_count;

    // Map disaster id to disaster
    mapping (uint => Disaster) public disasters_confirmed;

    
    // On deploy constructor
    constructor() {
        get_authorised[msg.sender] = true;
        num_notifications[msg.sender] = 1;
        num_correct_notifications[msg.sender] = 1;
    }


    // Function creates new notification, including validating that notification is allowed to be given by user
    function _new_notification(uint[] memory _regions, uint _disaster_type) public {
        require(get_authorised[msg.sender] == true, "User is not authorised");
        require(_disaster_type <= NUM_DISASTER_TYPES, "Not a classified type of disaster (0-5)");

        Notification memory notification = Notification({
            creator: msg.sender,
            times_out: block.timestamp + TIMEOUT
            // Could add stake amount too
        });

        // Increment how many notifications a user has made
        num_notifications[msg.sender] += _regions.length;
        
        // Check if user has not previously given notification for this region and type
        // Then append to array
        for (uint i = 0; i < _regions.length; i++) {
            _check_if_notification_works(_regions[i], _disaster_type);
            region_to_type_count[_regions[i]][_disaster_type].push(notification);
        }
    }


    // Function to check if the input regions and disaster type will work in the new notifications section as an external view function
    // This can be called outside as view function to validate if region will work beforehand
    function _check_if_notification_works(uint  _region, uint _disaster_type) public view {
        require(_region <= MAX_REGION);
        Notification[] memory current_region = region_to_type_count[_region][_disaster_type];
        for (uint j = 0; j < current_region.length; j++) {
            // Check notification is still in time (if so check if msg.sender has already given val)
            if (current_region[j].times_out > block.timestamp) {   // I THINK > SIGN IS CORRECT WAY ROUND (NEED TO VERIFIY WITH TEST)
                require(current_region[j].creator != msg.sender, "Address has already been used for this region");
            }
        }
    }


    // Counts total reputation of all active notifications in the input region
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

    // Checks if consensus exists in given region and type and creates disaster_confirmed value
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


    // Get reputation (THIS NEEDS MODIFIED AS CURRENTLY VERY SIMPLE)
    function _get_rep(address _address_to_update) public view returns (uint) {
        // Can use number of correct notifications and number of total notifications
        return num_correct_notifications[_address_to_update];// / num_notifications[_address_to_update];
    }
}