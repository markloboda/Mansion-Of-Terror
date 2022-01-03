

export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      {name: "Flashlight", type: "carry", inFocus: true},
      {name: "Fuse", type: "pick_up"},
      {name: "Fusebox", type: "insert", inFocus: true},
      {name: "Switch", type: "interact", inFocus: true}
    ]
  },
  Room2: {
    name: "second_room",
    interactables: [
      {name: "Flashlight", type: "carry", inFocus: true},
    ]
  },
  Room3: {
    name: "parkour_room",
    interactables: [
      {name: "Flashlight", type: "carry", inFocus: true}
    ]
  }
}
