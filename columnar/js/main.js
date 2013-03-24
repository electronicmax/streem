

// controllers and such 

function MainController($scope) {

	get_wordpress().then(function(entries) {
		console.log('entries', entries);
		$scope.$apply(function() {
			$scope.entries = entries.concat();
		});
	}).fail(function(x) { console.error('fail! ', x); })
}
