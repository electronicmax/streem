define([],
    function(util) {
	var ArticleView = Backbone.View.extend(
	    {
                events: { "click" : "_fire_click" },
		small_template:$('#article_template').html(),
                className : "article", 
		headline_template:$('#headline_template').html(),
                initialize:function() {
                     
                },
                render:function() {
                    this.$el.html('');
                    if (!this.options.model) { return this.el; }                    
                    this.$el.attr('uri', this.options.model.id);
                    if (!this.options.suppress_headlines && this.options.model.headline) {
                        this.$el.addClass('headline_article');
                    }
		    var html = this.options.headline ||
                        (!this.options.suppress_headlines && this.options.model.headline) ?
                        _.template(this.headline_template)({ a: this.options.model }) : _.template(this.small_template)({ a: this.options.model});
                    console.log(html);
                    this.$el.html(html);
		    return this.el;
		},
                update:function(m) {
                    this.options.model = m;
                    return this.render();
                },
                _fire_click:function() { this.trigger('click', this); }
	    }
	);
        
	var StreamView = Backbone.View.extend(
		{
		    initialize:function() {
                        this.set_filtered_type();
                    },
		    render:function() {
                        this.$el.html('');
                        var this_ = this;
			this.views = this.options.collection.map(
			    function(item) {
				var v = new ArticleView({model: item, suppress_headlines: true});
				this_.$el.append(v.render());
                                v.bind('click', function() { this_.trigger('item_clicked', v); });
				return v;
			    });
                        this.$el.isotope();
			return this.el;
		    },
                    set_filtered_type:function(type) {
                        // enter 'undefined' for 'all'
                        this.mode_test = function(x){ return type == undefined || (x.type == type); };
                    },
                    _update_filtered:function() {
                        var this_ = this;
                        this.views.map(function(view) { this_.mode_test(view.options.model) && this_._filter(view.options.model) ? view.$el.addClass('__keepers') : view.$el.removeClass('__keepers'); });
                        $(this.el).isotope({filter: ".__keepers"});                                                
                    },
                    set_filter:function(f) {
                        this._filter = f;
                        this._update_filtered();
                    },                    
                    clear_filter:function(f) {
                        this._filter = function(x) { return true; };
                        this._update_filtered();
                    },
                    set_sort:function(f) {
                       // this.$el.isotope({ getSortData:{sorder: f}, sortBy: 'sorder' });
                    },
                    refresh:function() {
                        this.$el.isotope('reLayout');
                        this.$el.isotope('reloadItems');                        
                    }
		}
	);

        var StreamHeadlineView = Backbone.View.extend(
            {
                initialize:function() {
                    // inside my el i should have a 'selected' block and a 'stream' block
                },                    
                render:function() {
                    var this_ = this;
                    console.log('making a streamview - ', this.$el.find('.stream'), this.$el.find('.stream')[0], this.$el.find('.selected')[0]);
                    this.streamview = new StreamView(
                        {
                            el: this.$el.find('.stream')[0],
                            collection:this.options.collection
                        });
                    this._shift = 0;
                    this.streamview.set_sort(function(x) { return -x.posted ; });
                    this.selectedview = new ArticleView(
                        {
                            el:this.$el.find('.selected')[0],
                            model:this.options.selected || (this.options.collection && this.options.collection[0])
                        }
                    );
                    this.streamview.bind('item_clicked', function(item) { this_.set_selected(item.options.model);  });
                    this.streamview.render();
                    this.selectedview.render();
                    return this.el;                    
                },
                set_sort:function(f) {
                    // extend sort function to support shifting to the left/right
                    var l = this.options.collection.length;
                    var sorted_chron = this.options.collection.sortBy(f).map(function(x) { return x.id; });
                    var sfn = function(x) { return sorted_chron.indexOf(x.id) - this_._shift; };
                    this.streamview.set_sort(sfn);
                },
                shiftLeft:function() { this.shiftBy(1); },
                shiftRight:function() { this.shiftBy(-1); },                
                shiftBy:function(i) {
                    this._shift = (this._shift ? this._shift : 0) + i;                    
                },
                update:function() {
                    if (!this.streamview || !this.selectedview) { return; }
                    this.streamview.update(this.options.collection);
                    this.selectedview.update(this.options.selected);
                },
                set_selected:function(m) {
                    this.options.selected = m;
                    this.streamview.set_filter(function(x) { return x.id !== m.id; });
                    this.selectedview.update(m);                    
                },
                getStreamView:function() {  return this.streamview;          },
                getSelectedView:function() {  return this.selectedview;      }                
            });
        
        
	return {
	    StreamView:StreamView,
	    ArticleView:ArticleView,
            StreamHeadlineView : StreamHeadlineView            
	};
    });
