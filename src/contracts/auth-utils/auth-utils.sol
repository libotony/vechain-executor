
pragma solidity >=0.4.22 <0.7.0;
pragma experimental ABIEncoderV2;

interface Authority {
    /// @notice get infomation about proposer "_signer"
    function get(address _signer) external view returns(bool listed, address endorsor, bytes32 identity, bool active);
    
    /// @notice get the first proposer in the candidates list.
    function first() external view returns(address);

    /// @notice get next one of proposer "_signer"
    function next(address _signer) external view returns(address);
}

interface Params {
    function get(bytes32 _key) external view returns(uint256);
}

contract AuthorityUtils {
    Authority constant authority = Authority(uint72(bytes9("Authority")));
    Params constant params = Params(uint48(bytes6("Params")));

    address constant zero = address(0);
    uint constant maxProposers = 101;

    struct Candidate{
        address master;
        address endorsor;
        bytes32 identity;
        bool endorsed;
        bool active;
    }

    function all() public view returns(Candidate[] memory list){
        uint256 requirement = endorsement();
        address[] memory _container = new address[](200);

        address curr = authority.first();
        uint count=0;
        
        for(;curr != zero;count++){
            _container[count] = curr;
            curr = authority.next(curr);
        }

        Candidate[] memory _all = new Candidate[](count);
        for(uint i = 0; i<count; i++){
            (, address endorsor, bytes32 identity, bool active) = authority.get(_container[i]);
            _all[i] = Candidate(_container[i], endorsor, identity, active, endorsor.balance >= requirement);
        }

        return _all;
    }

    function endorsement() public view returns(uint256 _endorsement) {
        return params.get(bytes32(uint256(uint160(bytes20("proposer-endorsement")))));
    }
}
