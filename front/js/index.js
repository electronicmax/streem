require(
    ['streamview', 'data/data.js', 'data/google-spreadsheet-connector.js'],
    function(view,data,googless) {
	// load up some stuff
        var i = 0;
        // reset the ids, probably not something we actually want to do
        var ss = new googless.SpreadSheet('0AmssmNSs4_VudGVsWjZQUEc3SkprcnRYS3lzRHpDcGc');
        
        var MainView = Backbone.View.extend(
            {
                events: {
                    "click .left_arrow":"_slide_left",
                    "click .right_arrow":"_slide_right",
                    "click .shuffle":"_shuffle",                    
                    "click .filters":"_toggle_filter"
                },
                initialize:function() {
                    this.offset = 0;
                },
                render:function() {
                    var shv = new view.StreamHeadlineView({ collection:this.options.data, el:this.el });
                    this.shv = shv;
                    shv.render();

                    // filter buttons
                    var controls_el = shv.get_controls_el();
                    // create filter buttons
                    _.uniq(data.items.map(function(x) { return x.type; })).map(
                        function(type) {
                            var t =_.template($("#filter_button_template").html())({type: type ? type : "all"});
                            $(t).appendTo(controls_el).click(
                                function(x) {
                                    console.log('setting filtered type ', type);
                                    shv.getStreamView().set_filtered_type(type);
                                });
                        });                                        
                },
                _slide_right:function() {
                    console.log("slide right");
                    this.offset++;
                    this.update_position();
                },
                _slide_left: function() {
                    console.log("slide left");
                    this.offset = Math.max(0,this.offset-1);
                    this.update_position();   
                },
                update_position : function() {
                    var multiplier = 3;
                    this.shv.getStreamView().$el.css("left", 700-multiplier*this.offset*170);
                },
                _shuffle:function() {
                    this.shv.shiftBy(2); 
                },
                _toggle_filter:function(el) {
                    var selector = $(this).attr('data-filter');
                    $container.isotope({ filter: selector });
                    return false;                    
                }                
            });

        ss.fetch().then(function(rows) {
                            console.log("got rows", rows);
                            rows.map(function(x) { x.id = i++; });                            
                            var main = new MainView({
                                         el:$("#main")[0],
                                         data: rows
                                     });
                            window.main = main;
                            main.render();
                        });
        
        
    });