define([],
    function(util) {
	var ArticleView = Backbone.View.extend(
	    {
                events: { "click" : "_fire_click" },
		template:$('#article_template').html(),
                className : "article", 
                initialize:function() {
                     
                },
                render:function() {
                    var this_ = this;
                    this.$el.html('');
                    if (!this.options.model) { return this.el; }                    
                    this.$el.attr('uri', this.options.model.id);
                    var html =  _.template(this.options.template || this.template)({ a: this.options.model});
                    this.$el.html(html);
                    this.$el.data('view', this);
                    if (this.options.model.type) {
                        this.options.model.type.replace(/;/g, ' ').split(' ').map(function(c) { this_.$el.addClass(c); });
                    }
                    if (this.options.model.importance) {
                        this.$el.addClass('importance-'+this.options.model.importance);
                    }
		    return this.el;
		},
                update:function(m) {
                    var this_ = this;
                    this.$el.fadeOut("fase",
                                     function() {
                                         this_.options.model = m;
                                         var el = this_.render();
                                         $(el).fadeIn('fast');
                                     });
                },
                _fire_click:function() { this.trigger('click', this); }
	    }
	);
        
	var StreamView = Backbone.View.extend(
		{
		    initialize:function() {
                        var this_ = this;
                        this._filters = [];
                        this.mode_test = function(x){
                            return this_._filters.reduce(function(f,g) { return ((f && f.call && f(x)) || (f && !f.call)) && g(x); }, true);
                        };
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
                        this.$el.isotope({
                                             layoutMode: 'masonry',
                                             getSortData:{ sorted : function(x) { return this_._sort(x); } },
                                             sortBy:'sorted'
                                         });
			return this.el;
		    },
                    add_filter:function(f) {
                        this._filters.push(f);
                        this._update_filtered();
                    },
                    getNumberofVisibleItems:function() {
                        return this.$el.find('.__keepers').length;
                    },
                    getVisibleItems:function() {
                        return this.$el.find('.__keepers').map(function(x) {
                                                                   return $(this).data("view").model;
                                                               });
                    },                    
                    remove_filter:function(f) {
                        this._filters = _(this._filters).without(f);
                        this._update_filtered();                        
                    },
                    _update_filtered:function() {
                        var this_ = this;
                        this.views.map(function(view) { this_.mode_test(view.options.model) ? view.$el.addClass('__keepers') : view.$el.removeClass('__keepers'); });
                        var newwidth = Math.max(1.0, this.getNumberofVisibleItems()/9) * 800;
                        this.$el.isotope({filter: ".__keepers"});
                        this.$el.isotope("reLayout");                        
                    },
                    clear_filters:function(f) {
                        this._filters = [];
                        this._update_filtered();
                    },
                    _sort:function(x) {
                        return this.f ? this.f(x) : x.toString();
                    },
                    set_sort:function(f) {
                        this.f = f;
                        this.$el.isotope('updateSortData', this.$el.children());
                        this.$el.isotope({sortBy: 'sorted'});                        
                    },
                    refresh:function() {
                        this.$el.isotope('reloadItems');
                        this.$el.isotope('reLayout');
                    }
		}
	);

        var StreamHeadlineView = Backbone.View.extend(
            {
                initialize:function() {
                    // inside my el i should have a 'selected' block and a 'stream' block
                },
                get_controls_el:function() { return this.$el.find('.controls'); },
                render:function() {
                    var this_ = this;
                    this.streamview = new StreamView(
                        {
                            el: this.$el.find('.stream')[0],
                            collection:this.options.collection
                        });
                    this._shift = 0;
                    this.selectedview = new ArticleView(
                        {
                            template:$("#selected_template").html(),
                            el:this.$el.find('.selected')[0],
                            model:this.options.selected || (this.options.collection && this.options.collection[0])
                        }
                    );
                    this.streamview.bind('item_clicked', function(item) { this_.set_selected(item.options.model);  });
                    this.streamview.render();
                    this.selectedview.render();
                    this.update_sort();
                    return this.el;                    
                },
                update_sort:function() {
                    var this_ = this;
                    var datesort = function(x) { return x.id; };
                    // extend sort function to support shifting to the left/right
                    var l = this.options.collection.length;
                    var sorted_chron = _(this.options.collection).sortBy(datesort).map(function(x) { return x.id; });
                    console.log('sorted ', sorted_chron);
                    var sfn = function(x) {
                        var id = $(x).data('view').options.model.id;
                        var sub = sorted_chron.indexOf(id) - this_._shift;
                        // console.log('id ', id, sub < 0 ? l - sub : sub);
                        return sub < 0 ? l - sub : sub % l;
                    };
                    this.streamview.set_sort(sfn);
                    // this.streamview.set_sort(function(x) { return -$(x).data('view').options.model.id; });
                },
                shiftLeft:function() { this.shiftBy(1); },
                shiftRight:function() { this.shiftBy(-1); },                
                shiftBy:function(i) {
                    var l = this.options.collection.length;
                    this._shift = (this._shift ? this._shift : 0) + i;
                    this._shift = this._shift % l;
                    if (this._shift < -l) { this._shift = 0; }                    
                    // console.log("shift is now ", this._shift);                    
                    this.update_sort();
                },
                update:function() {
                    if (!this.streamview || !this.selectedview) { return; }
                    this.streamview.update(this.options.collection);
                    this.selectedview.update(this.options.selected);
                },
                set_selected:function(m) {
                    this.options.selected = m;
                    if (this._sel_filter) {
                        this.streamview.remove_filter(this._sel_filter);
                    }
                    this._sel_filter = function(x) { return x.id !== m.id; };
                    this.streamview.add_filter(this._sel_filter);
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
