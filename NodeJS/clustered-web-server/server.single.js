'use strict' ;

process.on( 'SIGUSR1', () => {
    console.log( '%d catch USR1 stop signal !' , process.pid ) ;
    process.exit( 0 ) ;
}) ;

// Fibonacci recursive
function fibRecursive( n )
{
	if ( n < 0 )
    	return -1 ;
	
	if ( n < 2 )
    	return n ;
	
	return ( fibRecursive( n - 1 ) + fibRecursive( n - 2 ) ) ;
}

// Nombre aléatoire entre une valeur minimum et maximum. 
// Toutes deux inclusives.
function getRandomBetweenRange(min, max) {
	return ( Math.random() * ( max - min ) + min ).toFixed(0);
}

// Include Express
const express = require('express');

// Create a new Express application
const app = express();

// Little logger
app.use( ( req , res , next ) => {
	const date     = new Date().toJSON() ;
	const fulldate = date.slice(0,10).replace( /-/g , '/' ) + ' ' + date.slice(11,date.length-1) ;
	const ip       = req.headers['x-forwarded-for'] || req.connection.remoteAddress ;

	console.log('[%s][%s][worker:%s] -> %s %s' , fulldate , ip , process.pid , req.method , req.url ) ;
	next() ;
}) ;

// Perform
app.all( '/*' , ( req , res ) => {

	res.setHeader( 'Content-Type' , 'text/html; charset=utf8' ) ;

	res.write( "<script type=\"text/javascript\">" ) ;
	res.write( "    var start = new Date() ;" ) ;
	res.write( "    window.onload = function(){" ) ;
	res.write( "        setTimeout( function(){ location.reload() ; } , 1000 ) ;" ) ;
	res.write( "    }" ) ;
	res.write( "</script>" ) ;

	const entryFib = 40 ;

	res.write( "Fibonacci entry  : " + entryFib + "<br />" ) ;
	res.write( "Fibonacci result : " + fibRecursive( entryFib ) + "<br />" ) ;

	res.write( "<script type=\"text/javascript\">" ) ;
	res.write( "    document.write( \"Execution : \" + ( new Date() - start ) + \"ms \" ) ;" ) ;
	res.write( "</script>" ) ;

	res.end() ;
}) ;

// Start web-server
app.listen( 1234 , () => 
	console.log( 'Server %d running !' , process.pid )
) ;