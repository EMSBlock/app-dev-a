// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// console.log command
import "../contract-lib/hardhat/console.sol";

// NOTES
// Inherint property (If many fake notifications given for certain locations the )

contract NewVoting {

    // Minimum number of votes required for consensus to be reached
    uint256 public THRESHOLD = 10000;
    // Max time after creation that notification is considered active
    uint256 public TIMEOUT = 100000;

    uint256 public MAX_REGION = 360 * 180;

    uint8 public NUM_DISASTER_TYPES = 5;    // One more than given as 0 also allowed

    // Inital variables
    uint public vote_threshold;

    // Map user to authorised or not
    mapping (address => bool) public get_authorised;

    struct Notification {
        address creator;
        uint times_out;
    }

    // Notifications made
    mapping (address => uint) public num_notifications;

    // Notifications part of consensus
    mapping (address => uint) public num_correct_notifications;

    // Map user to reputation
    mapping (address => uint) public get_rep;

    // Map region to type list containing current count
    mapping (uint => Notification[][]) public region_to_type_count;

    

    // On deploy constructor
    constructor() {
        get_authorised[msg.sender] = true;
    }

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
        
        for (uint i = 0; i < _regions.length; i++) {
            _check_if_notification_works(_regions[i], _disaster_type);
            region_to_type_count[_regions[i]][_disaster_type].push(notification);
        }

        // REMOVE IF BELOW FUNCTION WORKS
        // for (uint i = 0; i < _regions.length; i++) {
        //     require(_regions[i] <= MAX_REGION);
        //     Notification[] memory current_region = region_to_type_count[_regions[i]][_disaster_type];
        //     for (uint j = 0; j < current_region.length; j++) {
        //         // Check notification is still in time (if so check if msg.sender has already given val)
        //         if (current_region[j].times_out > time_now) {   // I THINK > SIGN IS CORRECT WAY ROUND (NEED TO VERIFIY WITH TEST)
        //             require(current_region[j].creator != msg.sender, "Address has already been used for this region");
        //         }
        //     }
            
        // }
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

    function _confirm_consensus(uint _region, uint _disaster_type) public {
        uint count = _count_region(_region, _disaster_type);
        require(count >= THRESHOLD, "Consensus has not been reached");
        // Update correct notifications count
        Notification[] memory current_region = region_to_type_count[_region][_disaster_type];
        for (uint i = 0; i < current_region.length; i++) {
            if (current_region[i].times_out > block.timestamp) {
                num_correct_notifications[current_region[i].creator]++;
            }
        }
        // Remove all notifications for that region and disaster type
        delete region_to_type_count[_region][_disaster_type];

        // CREATE DISASTER CONFIRMED NOTIFICATION
        

        // Maybe incentivise by giving 10% stake to msg.sender at this point

    }

    // Get reputation (THIS NEEDS MODIFIED AS CURRENTLY VERY SIMPLE)
    function _get_rep(address _address_to_update) public view returns (uint) {
        // Can use number of correct notifications and number of total notifications
        return num_correct_notifications[_address_to_update];// / num_notifications[_address_to_update];
    }
}