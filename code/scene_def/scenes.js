

export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      {name: "Flashlight", type: "carry", carrying: true},
      {name: "Fuse", type: "carry", setConditions: {"carry_fuse": true}},
      {name: "Fusebox", type: "interact", interact: {play: ["fusebox_open_action", "Fuse_upper_insert", "Fuse_lower_insert"]}},
      {name: "Switch", type: "interact", interact: {play: ["HandleAnimation"]}},
      {name: "Invisible_openDoors", aabbEnabled: false, type: "interact", interact: {play: ["left_doorAction", "right_doorAction"]}},
    ],
    animations: {
      "left_doorAction": {before: ["disableAABB", "disableInteractable"], disableInteractables: ["Invisible_openDoors"], disableNodes: ["left_door"]},
      "right_doorAction": {before: ["disableAABB", "disableInteractable"], disableInteractables: ["Invisible_openDoors"], disableNodes: ["right_door"]},
      "garage_open_action": {conditions: ["fuse_inserted"]}, // garage open
      "fusebox_open_action": {conditions: ["!fusebox_open"], after: ["setCondition"], setConditions: {"fusebox_open": true}}, // open fusebox
      "Fuse_upper_insert": {before: ["disableInteractable"], disableInteractables: ["Fuse", "Fusebox"], conditions: ["carry_fuse", "fusebox_open", "!fuse_inserted"], after: ["setCondition"], setConditions: {"fuse_inserted": true}},
      "Fuse_lower_insert": {before: ["disableInteractable"], disableInteractables: ["Fuse", "Fusebox"], conditions: ["carry_fuse", "fusebox_open", "!fuse_inserted"], after: ["setCondition"], setConditions: {"fuse_inserted": true}},
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
