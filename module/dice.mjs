export function configureDiceSoNice(dice3d) {

		dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");

		dice3d.addColorset({
			name: 'cthack',
			description: "Cthulhu Hack Default",
			category: "Cthulhu Hack",
			foreground: '#000000',
			background: "#000000",
			texture: 'none',
			edge: '#000000',
			material: 'plastic',
			visibility: 'visible'
		},"preferred");		

		dice3d.addDicePreset({
			type: "d4",
			labels: [
				"systems/cthack/ui/dice/d4/d4-1.webp",
				"systems/cthack/ui/dice/d4/d4-2.webp",
				"systems/cthack/ui/dice/d4/d4-3.webp",
				"systems/cthack/ui/dice/d4/d4-4.webp",
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d6",
			labels: [
				"systems/cthack/ui/dice/d6/d6-1.webp",
				"systems/cthack/ui/dice/d6/d6-2.webp",
				"systems/cthack/ui/dice/d6/d6-3.webp",
				"systems/cthack/ui/dice/d6/d6-4.webp",
				"systems/cthack/ui/dice/d6/d6-5.webp",
				"systems/cthack/ui/dice/d6/d6-6.webp"
			],
			system: "cthack"
		});	

		dice3d.addDicePreset({
			type: "d8",
			labels: [
				"systems/cthack/ui/dice/d8/d8-1.webp",
				"systems/cthack/ui/dice/d8/d8-2.webp",
				"systems/cthack/ui/dice/d8/d8-3.webp",
				"systems/cthack/ui/dice/d8/d8-4.webp",
				"systems/cthack/ui/dice/d8/d8-5.webp",
				"systems/cthack/ui/dice/d8/d8-6.webp",
				"systems/cthack/ui/dice/d8/d8-7.webp",
				"systems/cthack/ui/dice/d8/d8-8.webp"
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d10",
			labels: [
				"systems/cthack/ui/dice/d10/d10-1.webp",
				"systems/cthack/ui/dice/d10/d10-2.webp",
				"systems/cthack/ui/dice/d10/d10-3.webp",
				"systems/cthack/ui/dice/d10/d10-4.webp",
				"systems/cthack/ui/dice/d10/d10-5.webp",
				"systems/cthack/ui/dice/d10/d10-6.webp",
				"systems/cthack/ui/dice/d10/d10-7.webp",
				"systems/cthack/ui/dice/d10/d10-8.webp",
				"systems/cthack/ui/dice/d10/d10-9.webp",
				"systems/cthack/ui/dice/d10/d10-10.webp"
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d12",
			labels: [
				"systems/cthack/ui/dice/d12/d12-1.webp",
				"systems/cthack/ui/dice/d12/d12-2.webp",
				"systems/cthack/ui/dice/d12/d12-3.webp",
				"systems/cthack/ui/dice/d12/d12-4.webp",
				"systems/cthack/ui/dice/d12/d12-5.webp",
				"systems/cthack/ui/dice/d12/d12-6.webp",
				"systems/cthack/ui/dice/d12/d12-7.webp",
				"systems/cthack/ui/dice/d12/d12-8.webp",
				"systems/cthack/ui/dice/d12/d12-9.webp",
				"systems/cthack/ui/dice/d12/d12-10.webp",
				"systems/cthack/ui/dice/d12/d12-11.webp",
				"systems/cthack/ui/dice/d12/d12-12.webp",
			],
			system: "cthack"
		});	

		dice3d.addDicePreset({
			type: "d20",
			labels: [
				"systems/cthack/ui/dice/d20/d20-1.webp",
				"systems/cthack/ui/dice/d20/d20-2.webp",
				"systems/cthack/ui/dice/d20/d20-3.webp",
				"systems/cthack/ui/dice/d20/d20-4.webp",
				"systems/cthack/ui/dice/d20/d20-5.webp",
				"systems/cthack/ui/dice/d20/d20-6.webp",
				"systems/cthack/ui/dice/d20/d20-7.webp",
				"systems/cthack/ui/dice/d20/d20-8.webp",
				"systems/cthack/ui/dice/d20/d20-9.webp",
				"systems/cthack/ui/dice/d20/d20-10.webp",
				"systems/cthack/ui/dice/d20/d20-11.webp",
				"systems/cthack/ui/dice/d20/d20-12.webp",
				"systems/cthack/ui/dice/d20/d20-13.webp",
				"systems/cthack/ui/dice/d20/d20-14.webp",
				"systems/cthack/ui/dice/d20/d20-15.webp",
				"systems/cthack/ui/dice/d20/d20-16.webp",
				"systems/cthack/ui/dice/d20/d20-17.webp",
				"systems/cthack/ui/dice/d20/d20-18.webp",
				"systems/cthack/ui/dice/d20/d20-19.webp",
				"systems/cthack/ui/dice/d20/d20-20.webp"
			],
			system: "cthack"
		});	
}