require(
    ['streamview', 'data/data.js', 'data/google-spreadsheet-connector.js'],
    function(view,data,googless) {
	// load up some stuff
        var i = 0;
        // reset the ids, probably not something we actually want to do
        data.items.map(function(x) { x.id = i++; });
        var ss = new googless.SpreadSheet('0AmssmNSs4_VudGVsWjZQUEc3SkprcnRYS3lzRHpDcGc');        
        ss.fetch().then(function(rows) {  console.log("got rows", rows);      });        
        
        var shv = new view.StreamHeadlineView(
            {
                collection:data.items, // raw collection in this case
                el:$('body')[0]
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
        // $('.shift_backward').click(function(x) { shv.shiftLeft(); });
        $('.shuffle').click(function(x) {  shv.shiftBy(2);   });

        // slidey arrows left and right 
        var offset = 0;
        var update_position = function() { shv.getStreamView().$el.css("left", 700-3*offset*170); };
        $('#main .right_arrow').click(function(x) {  offset++;   update_position();    });
        $('#main .left_arrow').click(function(x) {  offset = Math.max(0,offset-1);  update_position();    });
        
        // filter items when filter link is clicked >
        $('#filters a').click(
            function(){
                var selector = $(this).attr('data-filter');
                $container.isotope({ filter: selector });
                return false;
            });
    });