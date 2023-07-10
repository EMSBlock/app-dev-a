// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// console.log command
import "../contract-lib/hardhat/console.sol";


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
        uint creation_time;
    }

    struct Combined {
        address creator;
        uint region;
    }

    // struct ActiveRegions {
    //     uint region;
    //     uint start_time;
    //     uint disaster_type;
    // }

    // Map notification to user
    //uint[] public notification_list;
    mapping (Combined => bool) public get_used_address;
    // Map address to the cutoff point in the notifications
    //      list so search is not through inactive Notifications
    mapping (address => uint) public get_active_cutoff;

    // Map user to reputation
    mapping (address => uint) public get_rep;

    // Map region to type list containing current count
    mapping (uint => Notification[][]) public region_to_type_count;

    

    // On deploy constructor
    constructor() {
        get_authorised[msg.sender] = true;
    }

    function _check_input(uint[] memory _regions) public view {
        for (uint i=0; i < _regions.length; i++) {
            require(_regions[i] <= MAX_REGION, "Region is more than number of regions");
            //require()
        }
    }

    function _new_notification(uint[] memory _regions, uint _disaster_type) public {
        require(get_authorised[msg.sender] == true, "User is not authorised");
        require(_disaster_type <= NUM_DISASTER_TYPES, "Not a classified type of disaster (0-5)");
        _check_input(_regions);

        Notification memory notification = Notification({
            creator: msg.sender,
            creation_time: block.timestamp
        });

        //_clean_timeouts(REGION?);

        for (uint i = 0; i < _regions.length; i++) {
            require(_regions[i] <= MAX_REGION);
            require(!get_used_address[Combined({creator: msg.sender, region: _regions[i]})], "Address has already been used for this region");
            region_to_type_count[_regions[i]][_disaster_type].push(notification);
        }
    }

    // Find timedout notifications of user, remove value from 
    // function _clean_timeouts(address _clean_address) public {
    //     if (get_notification_list[_clean_address].length > 0) {
    //         for (uint i=get_active_cutoff[_clean_address]; i < get_notification_list[_clean_address].length; i++) {
                
    //         }
    //     }
    // }


    function _count_regions(uint _region, uint _disaster_type) external view returns (uint) {
        return region_to_type_count[_region][_disaster_type].length;
    }

    function _confirm_consensus(uint _region, uint _disaster_type) public {
        //_check_timeouts
    }

    // function _check_timeouts() public {
    //     require(get_authorised[msg.sender] == true, "User is not authorised");
    //     // negative from region_to_type_count values
    // }





    // Input locations in list
    // Input disaster type

    // Set timeout

    // Add to area, multiple by reputation

    // Check for consensus in area

    // If consensus reached, positive impact reputation

    // If timeout of other inputs, negative impact reputation

}