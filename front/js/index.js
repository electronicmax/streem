require(
    ['streamview','data/google-spreadsheet-connector.js','data/twitter-connector.js'],
    function(view,googless,Twitter) {
	// load up some stuff
        var i = 0;
        // reset the ids, probably not something we actually want to do
        var ss = new googless.SpreadSheet('0AmssmNSs4_VudGVsWjZQUEc3SkprcnRYS3lzRHpDcGc');
        var tt = new Twitter.Twetter('emax');
        var split_reduce = function(f, l) {
            return _.uniq(l.map(function(x) {
                             var fx = f(x);
                             if (fx) {  return fx.split(';').map(function(x) { return x.trim(); });   }
                             return [];
                         }).reduce(function(x,y) { return x.concat(y); }));
        };
        
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
                    var this_ = this;
                    $(window).keyup(function() { this_._keyup.apply(this_,arguments); });
                },
                render:function() {
                    var data = this.options.data;
                    var shv = new view.StreamHeadlineView({ collection:data, el:this.el });
                    this.shv = shv;
                    shv.render();
                    // filter buttons
                    var controls_el = shv.get_controls_el();
                    // create filter buttons
                    var filters = $("<div class='filters'></div>").appendTo(controls_el);
                    var types = split_reduce(function(x) { return x.type; }, data);
                    types.map(
                        function(type) {
                            var t =_.template($("#filter_button_template").html())({type: type ? type : "all"});
                            $(t).appendTo(filters).click(
                                function(x) {
                                    shv.getStreamView().set_filtered_type(type);
                                });
                        });

                    var tags = split_reduce(function(x) { return x.tags; }, data);
                    tags.map(function(type) {
                                 console.log("new type ", type);
                                 var t =_.template($("#filter_button_template").html())({type: type});
                                 $(t).appendTo(filters).click(
                                     function(x) {
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
                    console.log('_toggle filter  ', selector, el, $(this));
                    // this.shv.getStreamView().set_filtered_type(); // $container.isotope({ filter: selector });
                    return true;                    
                },
                _keyup:function(evt) {
                    if (evt.keyCode == 39) { return this._slide_right(); };
                    if (evt.keyCode == 37) { return this._slide_left(); };
                    if (evt.keyCode == 32) { return this._shuffle(); };
                    return undefined;
                }                
            });
        
        ss.fetch().then(function(rows) {
                            tt.fetch().then(function(tweet_rows) {
                                                rows = rows.concat(tweet_rows);
                                                rows.map(function(x) { x.id = i++; });
                                                var main = new MainView({
                                                                            el:$("#main")[0],
                                                                            data: rows
                                                                        });
                                                main.render();                                                
                                            });
                        });
        
        
    });