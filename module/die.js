export class Die6Cthack extends Die {
    constructor(termData){
        termData.faces = 6;
        super(termData);
    }

    /** @override **/
    static diceSoNiceReady(dice3d) {
        dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");
        
        dice3d.addDicePreset({
            type: "d6",
            labels: [
                "systems/cthack/ui/dice/D6_1.png",
                "systems/cthack/ui/dice/D6_2.png",
                "systems/cthack/ui/dice/D6_3.png",
                "systems/cthack/ui/dice/D6_4.png",
                "systems/cthack/ui/dice/D6_5.png",
                "systems/cthack/ui/dice/D6_6.png",
            ],
            system: "cthack"
        });
        
    }
}