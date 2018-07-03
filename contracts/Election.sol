pragma solidity ^0.4.17;

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        uint voteCount;
        uint maxVote;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    event voteLimitEvent (
        uint indexed votes
    );
    
    // Read/Write Candidates
    mapping(uint => Candidate) public candidates;
    // Store accounts that have voted
    mapping(address => Voter) public voters;

    // Store Candidates Count
    uint public candidatesCount;

    //Constructor
    constructor() public {
        addCandidate("10 Apartments 6%");
        addCandidate("5 Houses 8%");

        if (voters[msg.sender].maxVote == 0) {
            voters[msg.sender] = Voter(0,3);
        }
    }

    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount,_name,0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't exceeded the vote limit
        require(voters[msg.sender].voteCount<voters[msg.sender].maxVote,"vote limit exceeded.");

        // require a valid candidate
        require(_candidateId > 0,"candidate invalid.");

        // update that voter has voted
        voters[msg.sender].voteCount += 1;

        // update candidate vote Count
        candidates[_candidateId].voteCount += 1;
        
        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function unvote (uint _candidateId) public {
        // require that the vote count is positive
        require(voters[msg.sender].voteCount>0, "no valid vote found.");

        // require a valid candidate
        require(_candidateId > 0,"candidate invalid.");

        // update that voter has voted
        voters[msg.sender].voteCount -= 1;

        // update candidate vote Count
        candidates[_candidateId].voteCount -= 1;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function addMaxVotes (uint votes) public {
        require(!(votes<0 && voters[msg.sender].maxVote + votes < 0));
        voters[msg.sender].maxVote += votes;

        emit voteLimitEvent(votes);
    }
}