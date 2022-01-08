

export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      {name: "Flashlight", type: "carry", carrying: true},
      {name: "Fuse", type: "carry", setConditions: {"carry_fuse": true}},
      {name: "Fusebox", type: "interact", interact: {play: ["fusebox_open_action", "Fuse_upper_insert", "Fuse_lower_insert"]}, inFocus: true},
      {name: "Switch", type: "interact", interact: {play: ["HandleAnimation"]}, inFocus: true},
      {name: "Invisible_openDoors", aabbEnabled: false, type: "interact", interact: {play: ["left_doorAction", "right_doorAction"]}},
    ],
    animations: {
      "left_doorAction": {before: ["disableAABB"], disableNodes: ["left_door"]},
      "right_doorAction": {before: ["disableAABB"], disableNodes: ["right_door"]},
      "garage_open_action": {conditions: ["fuse_inserted"], after: ["disableAABB"], disableNodes: ["level_complete"]}, // garage open
      "fusebox_open_action": {conditions: ["!fusebox_open"], after: ["setCondition"], setConditions: {"fusebox_open": true}}, // open fusebox
      "Fuse_upper_insert": {before: ["disableInteractable"], disableInteractables: ["Fuse"], conditions: ["carry_fuse", "fusebox_open"], after: ["setCondition"], setConditions: {"fuse_inserted": true}},
      "Fuse_lower_insert": {before: ["disableInteractable"], disableInteractables: ["Fuse"], conditions: ["carry_fuse", "fusebox_open"], after: ["setCondition"], setConditions: {"fuse_inserted": true}},
      "HandleAnimation": {after: ["trigger", "resetAnimation"], trigger: ["garage_open_action"]}
    }
  },
  Room2: {
    name: "second_room",
    interactables: [
      {name: "Flashlight", type: "carry", carrying: true},
    ]
  },
  Room3: {
    name: "parkour_room",
    interactables: [
      {name: "Flashlight", type: "carry", carrying: true}
    ]
  }
}
