require(
    ['streamview', 'data/data.js'],
    function(view,data) {
	// load up some stuff
        var shv = new view.StreamHeadlineView(
            {
                collection:data.items, // raw collection in this case
                el:$('#main')[0]
            });
        shv.render();        
        window.shv = shv;

        // populate the filtrers
        _.uniq(data.items.map(function(x) { return x.type; })).map(
            function(type) {
                var t =_.template($("#filter_button_template").html())({type: type ? type : "all"});
                $(t).appendTo('#filter_buttons').click(function(x) { shv.getStreamView().set_filtered_type(type);  });
            });

        // add shift left right buttons
        $('<button>&lt;</button>').appendTo('#shift_buttons').click(function(x) { shv.shiftLeft(); });
        $('<button>&gt;</button>').appendTo('#shift_buttons').click(function(x) { shv.shiftRight(); });        
        
        // filter items when filter link is clicked
        $('#filters a').click(
            function(){
                var selector = $(this).attr('data-filter');
                $container.isotope({ filter: selector });
                return false;
            });

        shv.getStreamView().apply_isotope();
        shv.getStreamView().refresh();
        
    });