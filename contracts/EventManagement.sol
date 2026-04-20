// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract EventManagement {
  enum EventCategory { Conference, Workshop, Meetup, Social, Other }

  struct EventDetails {
    uint256 id;
    string title;
    string description;
    uint256 date;
    address organizer;
    bool isActive;
    EventCategory category;
    uint256 maxParticipants;
    uint256 currentParticipants;
  }

  uint256 public nextEventId;
  mapping(uint256 => EventDetails) public events;
  mapping(uint256 => mapping(address => bool)) public registeredParticipants;

  event EventCreated(
    uint256 indexed id,
    string title,
    string description,
    uint256 date,
    address indexed organizer
  );

  event EventRegistered(
    uint256 indexed eventId,
    address indexed participant
  );

  event EventCancelled(
    uint256 indexed eventId,
    address indexed organizer
  );

  function createEvent(
    string calldata title,
    string calldata description,
    uint256 date,
    EventCategory category,
    uint256 maxParticipants
  ) public {
    require(bytes(title).length > 0, "Event title is required");
    require(bytes(description).length > 0, "Event description is required");
    require(date > block.timestamp, "Event date must be in the future");
    require(maxParticipants > 0, "Max participants must be greater than 0");

    uint256 eventId = nextEventId;

    events[eventId] = EventDetails({
      id: eventId,
      title: title,
      description: description,
      date: date,
      organizer: msg.sender,
      isActive: true,
      category: category,
      maxParticipants: maxParticipants,
      currentParticipants: 0
    });

    nextEventId++;

    emit EventCreated(eventId, title, description, date, msg.sender);
  }

  function getEvent(uint256 eventId) public view returns (EventDetails memory) {
    require(eventId < nextEventId, "Event does not exist");
    return events[eventId];
  }

  function registerForEvent(uint256 eventId) public {
    require(eventId < nextEventId, "Event does not exist");
    require(events[eventId].isActive, "Event is not active");
    require(!registeredParticipants[eventId][msg.sender], "Already registered");
    require(events[eventId].date > block.timestamp, "Event has passed");
    require(events[eventId].currentParticipants < events[eventId].maxParticipants, "Event is full");

    registeredParticipants[eventId][msg.sender] = true;
    events[eventId].currentParticipants++;

    emit EventRegistered(eventId, msg.sender);
  }

  function cancelEvent(uint256 eventId) public {
    require(eventId < nextEventId, "Event does not exist");
    require(events[eventId].organizer == msg.sender, "Only organizer can cancel");
    require(events[eventId].isActive, "Event already cancelled");

    events[eventId].isActive = false;

    emit EventCancelled(eventId, msg.sender);
  }
}
