# How to use the system in local

With the change to LevelDB, there is a step to create the packs in local.

- Clone the repository as usual
- You need to have a node.js installation done
- You must be in Foundry welcome page and not in a world. In the system directory, do : 
    - npm install will generate the node_modules depending on package.json and package-lock.json
    - npm run pullJSONtoLDB will create the packs depending of the content of src/packs directory

# To update the packs
-  Unpack data : npm run pushLDBtoJSON will create the src/packs files and export all actors/items in json files
-  Pack data : npm run pullJSONtoLDB will create the packs from the json files