// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Append-only guestbook: one transaction records a short message and social handles.
contract CommunityGuestbook {
    struct Entry {
        address author;
        uint64 timestamp;
        string message;
        string xHandle;
        string linkedin;
        string farcaster;
    }

    Entry[] private _entries;

    uint256 public constant MAX_MESSAGE_LEN = 400;
    uint256 public constant MAX_HANDLE_LEN = 96;
    uint256 public constant COOLDOWN = 1 hours;

    mapping(address => uint256) public lastEntryAt;

    event EntryPosted(
        uint256 indexed index,
        address indexed author,
        uint64 timestamp,
        string message,
        string xHandle,
        string linkedin,
        string farcaster
    );

    function leaveEntry(
        string calldata message,
        string calldata xHandle,
        string calldata linkedin,
        string calldata farcaster
    ) external {
        uint256 mlen = bytes(message).length;
        require(mlen > 0 && mlen <= MAX_MESSAGE_LEN, "message_len");
        require(bytes(xHandle).length <= MAX_HANDLE_LEN, "x_len");
        require(bytes(linkedin).length <= MAX_HANDLE_LEN, "linkedin_len");
        require(bytes(farcaster).length <= MAX_HANDLE_LEN, "farcaster_len");

        uint256 last = lastEntryAt[msg.sender];
        require(last == 0 || block.timestamp >= last + COOLDOWN, "cooldown");

        Entry memory e = Entry({
            author: msg.sender,
            timestamp: uint64(block.timestamp),
            message: message,
            xHandle: xHandle,
            linkedin: linkedin,
            farcaster: farcaster
        });
        _entries.push(e);
        lastEntryAt[msg.sender] = block.timestamp;

        uint256 idx = _entries.length - 1;
        emit EntryPosted(idx, msg.sender, e.timestamp, message, xHandle, linkedin, farcaster);
    }

    function entryCount() external view returns (uint256) {
        return _entries.length;
    }

    function getEntry(uint256 index)
        external
        view
        returns (
            address author,
            uint64 timestamp,
            string memory message,
            string memory xHandle,
            string memory linkedin,
            string memory farcaster
        )
    {
        Entry storage ent = _entries[index];
        return (ent.author, ent.timestamp, ent.message, ent.xHandle, ent.linkedin, ent.farcaster);
    }

    /// @notice Latest entries first; `maxItems` capped at 20 for RPC-friendly reads.
    function lastEntries(uint256 maxItems)
        external
        view
        returns (
            address[] memory authors,
            uint64[] memory timestamps,
            string[] memory messages,
            string[] memory xHandles,
            string[] memory linkedins,
            string[] memory farcasters
        )
    {
        uint256 n = _entries.length;
        if (n == 0) {
            return (authors, timestamps, messages, xHandles, linkedins, farcasters);
        }
        uint256 cap = maxItems > 20 ? 20 : maxItems;
        uint256 take = n < cap ? n : cap;
        authors = new address[](take);
        timestamps = new uint64[](take);
        messages = new string[](take);
        xHandles = new string[](take);
        linkedins = new string[](take);
        farcasters = new string[](take);
        for (uint256 i = 0; i < take; i++) {
            uint256 idx = n - 1 - i;
            Entry storage ent = _entries[idx];
            authors[i] = ent.author;
            timestamps[i] = ent.timestamp;
            messages[i] = ent.message;
            xHandles[i] = ent.xHandle;
            linkedins[i] = ent.linkedin;
            farcasters[i] = ent.farcaster;
        }
    }
}
