var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
    var electionInstance;

    it("initialize with two candidates", function () {
        return Election.deployed().then(function (instance) {
            return instance.candidatesCount();
        }).then(function (count) {
            assert.equal(count, 2);
        });
    });

    it("initializes the candidates with the correct values", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then(function (candidate) {
            assert.equal(candidate[0], 1, "contains the correct id");
            assert.equal(candidate[1], "Candidate 1", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            return electionInstance.candidates(2);
        }).then(function (candidate) {
            assert.equal(candidate[0], 2, "contains the correct id");
            assert.equal(candidate[1], "Candidate 2", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
        });
    });

    it("allows a voter to cast votes under max vote limit(3)", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[0] });
            return electionInstance.candidates(candidateId);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "accepts first vote");
            electionInstance.vote(candidateId, { from: accounts[0] });
            return electionInstance.candidates(candidateId);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 2, "accepts 2nd vote");
            electionInstance.vote(candidateId, { from: accounts[0] });
            return electionInstance.candidates(candidateId);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 3, "accepts 3rd vote");
            return electionInstance.voters(accounts[0]);
        }).then(function (voter) {
            assert.equal(voter[1], 3, "the voter has 3 vote");
        });
    });

    it("throws an exception for vote exceed limit", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 2;
            return electionInstance.vote(candidateId, { from: accounts[0] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 0, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 3, "candidate 2 did not receive any votes");
        });
    });

    it("allows to add a voter's max vote limit", function() {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            electionInstance.addMaxVotes(3, { from: accounts[0] });
            return electionInstance.voters(accounts[0]);
        }).then(function (voter) {
            assert.equal(voter[1], 6, "the voter 1 has 3 more votes");
        });
    });

    it("voters can vote under new limit", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[0] });
            return electionInstance.voters(accounts[0]);
        }).then(function (voter) {
            assert.equal(voter[1], 6, "the voter 1 has 3 more votes");
            return electionInstance.candidates(candidateId);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 4, "candidate 2 did receive 1 vote");
        });
    });    

    // it("allows a voter to cast a vote", function () {
    //     return Election.deployed().then(function (instance) {
    //         electionInstance = instance;
    //         candidateId = 1;
    //         return electionInstance.vote(candidateId, { from: accounts[0] });
    //     }).then(function (receipt) {
    //         assert.equal(receipt.logs.length, 1, "an event was triggered");
    //         assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
    //         assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
    //         return electionInstance.voters(accounts[0]);
    //     }).then(function (voter) {
    //         assert.equal(voter[0], 1, "the voter has voted");
    //         assert.equal(voter[1], 3, "the voter has 3 vote");
    //         return electionInstance.candidates(candidateId);
    //     }).then(function (candidate) {
    //         var voteCount = candidate[2];
    //         assert.equal(voteCount, 1, "increments the candidate's vote count");
    //     });
    // });

    // it("allows a voter to cast an unvote", function () {
    //     return Election.deployed().then(function (instance) {
    //         electionInstance = instance;
    //         candidateId = 1;
    //         return electionInstance.unvote(candidateId, { from: accounts[0] });
    //     }).then(function (receipt) {
    //         assert.equal(receipt.logs.length, 1, "an event was triggered");
    //         assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
    //         assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
    //         return electionInstance.voters(accounts[0]);
    //     }).then(function (voter) {
    //         assert.equal(voter[0], 0, "the voter has voted");
    //         assert.equal(voter[1], 3, "the voter has 3 vote");
    //         // assert.equal(voter[2][candidateId], 1, "the voter has voted candidate 1");
    //         return electionInstance.candidates(candidateId);
    //     }).then(function (candidate) {
    //         var voteCount = candidate[2];
    //         assert.equal(voteCount, 0, "decrements the candidate's vote count");
    //     });
    // });

    // it("throws an exception for invalid candidates", function () {
    //     return Election.deployed().then(function (instance) {
    //         electionInstance = instance;
    //         return electionInstance.vote(99, { from: accounts[1] })
    //     }).then(assert.fail).catch(function (error) {
    //         assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    //         return electionInstance.candidates(1);
    //     }).then(function (candidate1) {
    //         var voteCount = candidate1[2];
    //         assert.equal(voteCount, 0, "candidate 1 did not receive any votes");
    //         return electionInstance.candidates(2);
    //     }).then(function (candidate2) {
    //         var voteCount = candidate2[2];
    //         assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    //     });
    // });
});