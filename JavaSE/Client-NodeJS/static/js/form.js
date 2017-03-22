$( document ).ready(function() {

    $("input[value='Stop']").click(function(event){

        $('img').css('visibility','visible');

        $.getJSON( '/ws/stop/json' , function( data ){
            console.log(data);
        })
        .fail(function(){
            console.log('Erreur');
        })
        .always(function() {
            $('img').css('visibility','hidden');
        });
    }) ;

    $('form').submit(function(event){
    	event.preventDefault() ;

    	$('img').css('visibility','visible');

    	$.getJSON( '/ws/rescue-me/' + $('#firstname').val() + '/' + $('input:radio[name=gender]:checked').val() + '/' + $('#age').val() + '/json' , function( data ){
    		console.log( data ) ;
    	})
    	.fail(function() {
		    alert( "Une erreur est survenue !" ) ;
		})
		.always(function() {
		    $('img').css('visibility','hidden');
		});
    }) ;
});