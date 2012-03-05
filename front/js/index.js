require(
    ['streamview', 'data/data.js'],
    function(view,data) {
	// load up some stuff

        var i = 0;
        data.items.map(function(x) { x.id = i++; });        
        
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
                $(t).appendTo('#filter_buttons').click(function(x) {
                                                           console.log('setting filtered type ', type);
                                                           shv.getStreamView().set_filtered_type(type);
                                                       });
            });

        // add shift left right buttons
        $('<button>&lt;&lt;</button>').appendTo('#shift_buttons').click(function(x) { shv.shiftLeft(); });
        $('<button>&gt;&gt;</button>').appendTo('#shift_buttons').click(function(x) { shv.shiftRight(); });
        $('<button>&lt;</button>').appendTo('#shift_buttons').click(function(x) {
                                                                        var left = parseInt(shv.getStreamView().$el.css("left").slice(0,-2));
                                                                        console.log(shv.getStreamView().$el.css("left").slice(0,-2));
                                                                        left -= 170*4;
                                                                        console.log('< left : ', left);
                                                                        shv.getStreamView().$el.css("left", left);
                                                                    });
        $('<button>&gt;</button>').appendTo('#shift_buttons').click(function(x) {
                                                                        var left = parseInt(shv.getStreamView().$el.css("left").slice(0,-2));
                                                                        left += 170*4;
                                                                        console.log('> left : ', left);
                                                                        shv.getStreamView().$el.css("left", left);                                                                        
                                                                    });

        // filter items when filter link is clicked
        $('#filters a').click(
            function(){
                var selector = $(this).attr('data-filter');
                $container.isotope({ filter: selector });
                return false;
            });
    });