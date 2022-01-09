import room2Animations from "./room2Animations.js";
import room3Animations from "./room3Animations.js";


export const scenes = {
  Room1: {
    name: "first_room",
    maxDuration: 90000,
    interactables: [
      { name: "Flashlight", type: "carry", carrying: true },
      { name: "Fuse", type: "carry", setConditions: { carry_fuse: true } },
      {
        name: "Fusebox",
        type: "interact",
        interact: {
          play: [
            "fusebox_open_action",
            "Fuse_upper_insert",
            "Fuse_lower_insert",
          ],
        },
      },
      {
        name: "Switch",
        type: "interact",
        interact: { play: ["HandleAnimation"] },
      },
    {
        name: "Invisible_openDoors",
        aabbEnabled: false,
        type: "interact",
        interact: { play: ["left_doorAction", "right_doorAction"] },
      },
    ],
    animations: {
      left_doorAction: {
        before: ["disableAABB", "disableInteractable"],
        disableInteractables: ["Invisible_openDoors"],
        disableNodes: ["left_door"],
      },
      right_doorAction: {
        before: ["disableAABB", "disableInteractable"],
        disableInteractables: ["Invisible_openDoors"],
        disableNodes: ["right_door"],
      },
      garage_open_action: { 
        conditions: ["fuse_inserted"],
        after: ["gotoNextLevel"]  
      }, // garage open
      fusebox_open_action: {
        conditions: ["!fusebox_open"],
        after: ["setCondition"],
        setConditions: { fusebox_open: true },
      }, // open fusebox
      Fuse_upper_insert: {
        before: ["disableInteractable"],
        disableInteractables: ["Fuse", "Fusebox"],
        conditions: ["carry_fuse", "fusebox_open", "!fuse_inserted"],
        after: ["setCondition"],
        setConditions: { fuse_inserted: true },
      },
      Fuse_lower_insert: {
        before: ["disableInteractable"],
        disableInteractables: ["Fuse", "Fusebox"],
        conditions: ["carry_fuse", "fusebox_open", "!fuse_inserted"],
        after: ["setCondition"],
        setConditions: { fuse_inserted: true },
      },
      HandleAnimation: {
        after: ["trigger", "resetAnimation"],
        trigger: ["garage_open_action"],
      },
    },
  },
  Room2: {
    name: "second_room",
    maxDuration: 60000,
    interactables: [
      { name: "Flashlight", type: "carry", carrying: true },
      {
        name: "Invisible.002",
        type: "collide",
        interact: { play: Object.keys(room2Animations).filter(string => {
          return string.includes("cell");
        } ) },
      },
    ],
    animations: room2Animations,
  },
  Room3: {
    maxDuration: 120000,
    name: "parkour_room",
    interactables: [{ name: "Flashlight", type: "carry", carrying: true }],
    animations: room3Animations
  },
};
