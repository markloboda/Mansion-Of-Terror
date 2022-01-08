#!/bin/python3
import sys
import json

# Usage python3 ./loadAnimation.py pathToGltf nameLike(if animations are xxx.001, 002, 003 supply xxx) conditions(Conditions for playing animation)

file = sys.argv[1]
nameLike = sys.argv[2]
conditions = sys.argv[3:]

gltf = json.load(open(file))

result = {}
for animation in gltf['animations']:
  result[animation["name"]] = {"conditions": conditions}

print(result)
