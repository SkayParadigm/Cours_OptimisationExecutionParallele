$( document ).ready(function() {
	$('form').submit(function(event){
		event.preventDefault() ;

		$('img').show() ;

		$('div#result').html('');

		$.getJSON( "/ws/" + $('input').val() + "/json", function( data ) {
			$('div#result').html('Result : ' + data.result ) ;
			console.log(data);
		})

		.fail(function(){
			alert( 'Network error !' ) ;
		})

		.always(function(){
			$('img').hide() ;
		}) ;
	}) ;
}) ;