var data = {hola: "Hola mundo", 
			items:
					[{"tipo":"cancion","numero":0, "track": {"name":"Lo mejor del mundo", "duracion":1, "uri":"spotify:track:7pk3EpFtmsOdj8iUhjmeCM"}},
					{"tipo":"cancion","numero":1, "track": {"name":"La florecita", "duracion":1, "uri":"spotify:track:7pk3EpFtffffUhjmeCM"}},
					{"tipo":"cancion","numero":2, "track": {"name":"comer", "duracion":2, "uri":"spotify:track:7pk3EpFtmsOsf548iUmeCM"}}]
			};

describe("cancionesNombres", function(){
	it("Muestra los nombres en una posicion", function(){
		expect(cancionesNombres(data, 1)).toBe("La florecita");

	});
	
});
