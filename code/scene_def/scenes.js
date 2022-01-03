

export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      {name: "Flashlight", type: "pick_up", inFocus: true},
      {name: "Fuse", type: "pick_up"}
    ]
  },
  Room2: {
    name: "second_room",
    interactables: [
      {name: "Flashlight", type: "pick_up", inFocus: true}
    ]
  },
  Room3: {
    name: "parkour_room",
    interactables: [
      {name: "Flashlight", type: "pick_up", inFocus: true}
    ]
  }
}
