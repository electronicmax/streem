

// controllers and such 


function MainController($scope) {
	$scope.imgs =
		[
			'img/back/32.jpg',
			'img/back/6564176627_cd3ca796a0_o.jpg',
			'img/back/bridge.jpg',
			// 'img/back/broad.jpg',
			'img/back/dome-night.jpg',
			// 'img/back/dsc00117hp8.jpg',
			'img/back/img1.jpg',
			'img/back/img2.jpg',
			'img/back/blank',			
			'img/back/London_Underground_Tube_Stock_1992.jpg',
			'img/back/P1010188.jpg',
			'img/back/P1020815.jpg',
			'img/back/pahk.jpg',
			'img/back/Regent_Street,_London_-_DSC04309.JPG',
			'img/back/Shinjuku_Skyscrapers.JPG'
		];
	console.log('$scope is ', $scope);

	get_wordpress().then(function(entries) {
		console.log('entries', entries);
		$scope.$apply(function() {
			$scope.entries = entries.concat();
		});
	}).fail(function(x) { console.error('fail! ', x); })

	var i = 0;
	setInterval(function() {
		var next = (i + 1)%$('.backdrop_image').length;
		console.log('unselecting ', i, ' selecting ', next);		
		$($('.backdrop_image')[next]).addClass('selected');
		$($('.backdrop_image')[i]).removeClass('selected');
		i = next;
	}, 5000);
}
