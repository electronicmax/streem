require(
    ['streamview', 'data/data.js'],
    function(view,data) {
	// load up some stuff
        console.log(" DATA ITEMS ARE ", data.items);
        var sv = new view.StreamView(
            {
                collection:data.items, // raw collection in this case
                el:$('#container')[0]
            });
        sv.render();
        window.sv = sv;
    });