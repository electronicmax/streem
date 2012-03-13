require(
    ['streamview','data/google-spreadsheet-connector.js','data/twitter-connector.js'],
    function(view,googless,Twitter) {
        var STATIC_URL = 'http://robostar.csail.mit.edu/emax';
        
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
        var FilterButtonView = Backbone.View.extend(
            {
                events : { 'click button': '_click'   },
                className:"filter_button",                
                template:$("#filter_button_template").html(),
                initialize:function() {
                },
                render:function() {
                    this.$el.html('');
                    this.$el.html(_(this.template).template()({label:this.options.label}));
                    this.$el.data('view', this);
                    this.options.enabled ? this.$el.addClass('filter_enabled') : '';
                    return this.el;
                },
                _click:function() {
                    this.options.enabled = !this.options.enabled;
                    this.options.enabled ? this.$el.addClass('filter_enabled') : this.$el.removeClass('filter_enabled');
                    (this.options.toggle !== undefined) ? this.options.toggle(this.options.enabled) : '';
                    return;
                },
                set_unselected:function() {
                    this.options.enabled = false;
                    this.$el.removeClass('filter_enabled');
                    // do not call toggle
                }
            });
        
        var MainView = Backbone.View.extend(
            {
                events: {
                    "click .left_arrow":"_slide_left",
                    "click .right_arrow":"_slide_right",
                    "click .shuffle":"_shuffle"
                },
                initialize:function() {
                    this.offset = 0;
                    var this_ = this;
                    $(window).keyup(function() {
                                        return this_._keyup.apply(this_,arguments);
                                    });
                    this.bind("filter_change", function(num_items) {
                                  this_._reset_slide();
                                  var l = this_.shv.getStreamView().getVisibleItems();
                                  if (l.length) {
                                      this_.shv.set_selected(l[0]);
                                  }
                              });
                },
                render:function() {
                    var this_ = this;
                    var data = this.options.data;
                    var shv = new view.StreamHeadlineView({ collection:data, el:this.el });
                    this.shv = shv;
                    shv.render();
                    // filter buttons
                    var controls_el = shv.get_controls_el();
                    // create filter buttons
                    var filters = $("<div class='type_filters'></div>").appendTo(controls_el);
                    var types = split_reduce(function(x) { return x.type; }, data);
                    types.map(function(type) {
                            var m = function(x) { return x.type && x.type.indexOf(type) >= 0; };
                            var b = new FilterButtonView({
                                                             label:type,
                                                             toggle:function(on) {
                                                                 console.log( on ? "adding type filter " + type : " removing type filter " + type );
                                                                 on ? shv.getStreamView().add_filter(m) : shv.getStreamView().remove_filter(m);
                                                                 if (on && this_.options.mutually_exclusive_filters && this_._type_filter &&
                                                                     this_._type_filter !== m) {
                                                                     // deselect others
                                                                     shv.getStreamView().remove_filter(this_._type_filter);
                                                                     // manually deselect others
                                                                     b.$el.parent().find('.filter_button').filter(
                                                                         function() {  return this !== b.el; }).map(
                                                                             function() {
                                                                                 $(this).data('view').set_unselected();
                                                                             });
                                                                 }
                                                                 if (this_.options.mutually_exclusive_filters) { this_._type_filter = m; };
                                                                 this_.trigger('filter_change');
                                                             }
                                                         }
                                                        );
                            filters.append(b.render());                            
                        });
                    filters = $("<div class='tag_filters'></div>").appendTo(controls_el);
                    var tags = split_reduce(function(x) { return x.tags; }, data);
                    tags.map(function(tag) {
                                 var m = function(x) { return x.tags && x.tags.indexOf(tag) >= 0; };
                                 var b = new FilterButtonView({
                                                                  label:tag,
                                                                  toggle:function(on) {
                                                                      console.log( on ? "adding tag filter " + tag : " removing filter " + tag );
                                                                      on ? shv.getStreamView().add_filter(m) : shv.getStreamView().remove_filter(m);
                                                                      if (on && this_.options.mutually_exclusive_filters && this_._tag_filter &&
                                                                         this_._tag_filter !== m) {
                                                                          shv.getStreamView().remove_filter(this_._tag_filter);
                                                                          b.$el.parent().find('.filter_button').filter(
                                                                              function() {  return this !== b.el; }).map(
                                                                                  function() {
                                                                                      $(this).data('view').set_unselected();
                                                                                  });
                                                                      }
                                                                      if (this_.options.mutually_exclusive_filters) { this_._tag_filter = m; };                                                     
                                                                      this_.trigger('filter_change');
                                                                      
                                                                  }
                                                              });
                                 filters.append(b.render());                                                             
                        });

                    shv.getStreamView().bind('item_clicked', function() { $("#main").animate({scrollTop:0},1000);   });
                },
                _reset_slide:function() {
                    this.offset = 0;
                    this.update_position();                    
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
                _keyup:function(evt) {
                    if (evt.keyCode == 39) { this._slide_right();  };
                    if (evt.keyCode == 37) { this._slide_left(); };
                    if (evt.keyCode == 32) { this._shuffle(); };
                    return undefined;
                }                
            });
        
        ss.fetch().then(function(rows) {
                            tt.fetch().then(function(tweet_rows) {
                                                rows = rows.concat(tweet_rows);
                                                rows.map(function(x) { x.id = i++; });
                                                var main = new MainView({
                                                                            el:$("#main")[0],
                                                                            data: rows,
                                                                            mutually_exclusive_filters:true
                                                                        });
                                                main.render();                                                
                                            });
                        });

        if (!$.browser.webkit)  {   document.location = STATIC_URL;        }
    });