

export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      {name: "Flashlight", type: "carry", carrying: true},
      {name: "Fuse", type: "carry", setConditions: {"carry_fuse": true}},
      {name: "Fusebox", type: "interact", interact: {play: ["fusebox_open_action", "Fuse_upper_insert", "Fuse_lower_insert"]}, inFocus: true},
      {name: "Switch", type: "interact", interact: {play: ["HandleAnimation"]}, inFocus: true}
    ],
    animations: {
      "left_doorAction": {after: "disableAABB", disableNodes: ["left_door"], playOnLoad: true},
      "right_doorAction": {after: "disableAABB", disableNodes: ["right_door"], playOnLoad: true},
      "garage_open_action": {conditions: ["fuse_inserted"]}, // garage open
      "fusebox_open_action": {conditions: ["!fusebox_open"], after: "setCondition", setConditions: {"fusebox_open": true}}, // open fusebox
      "Fuse_upper_insert": {conditions: ["carry_fuse"], after: "setCondition", setConditions: {"fuse_inserted": true}},
      "Fuse_lower_insert": {conditions: ["carry_fuse"], after: "setCondition", setConditions: {"fuse_inserted": true}},
      "HandleAnimation": {after: "trigger", trigger: "garage_open_action"}
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
