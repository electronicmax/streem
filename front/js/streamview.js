define([],
    function(util) {
        
	var ArticleView = Backbone.View.extend(
	    {
		small_template:$('#article_template').html(),
                className : "article", 
		headline_template:$('#headline_template').html(),
                initialize:function() {
                    
                },
                render:function() {
                    this.$el.attr('uri', this.options.model.id);
                    if (this.options.model.headline) {
                        this.$el.addClass('headline_article');
                    }                        
		    var html = this.options.model.headline ?
                        _.template(this.headline_template)({ a: this.options.model }) :
                        _.template(this.small_template)({ a: this.options.model});
                    console.log(html);
                    this.$el.html(html);
		    return this.el;
		}		
	    }
	);
        
	var StreamView = Backbone.View.extend(
		{
		    initialize:function() {},
		    render:function() {
                        var this_ = this;
			var views = this.options.collection.map(
			    function(item) {
				var v = new ArticleView({ model : item });
				this_.$el.append(v.render());
		                console.log(" v " , v);
				return v;
			    });			
			$(this.el).isotope();
			return this.el;
		    }		    
		}
	);

	return {
	    StreamView:StreamView,
	    ArticleView:ArticleView
	};
    });