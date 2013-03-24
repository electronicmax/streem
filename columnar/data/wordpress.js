
var WORDPRESS_URL = "cache/wordpress.xml"; // "http://thefutureispersonal.wodpress.com/feed/atom/";
var get_wordpress  = function() {
	// returns a deferred
	var convert = function(x) {
		return $(x).find('entry').map(function(e) {
			var $this = $(this);
			return {
				title: $this.find('title').text(),
				categories: $this.find('category').map(function() { return $(this).attr('term'); }).get(),
				contents: $this.find('content').text(),
				published: (Date.parse($this.find('published').text())),
				updated: $this.find('updated').text(),
				link: $this.find('link').attr('href'),
			};				
		}).get();
	};
    return $.ajax({url: WORDPRESS_URL, dataType:"xml"}).pipe(convert);
};
