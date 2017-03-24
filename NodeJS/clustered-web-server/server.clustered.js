'use strict' ;

// Include the cluster module
const cluster = require('cluster');

// Code to run if we're in the master process
if( cluster.isMaster )
{
	console.log( 'Master %d running!' , process.pid ) ;

    // Count the machine's CPUs
    const cpuCount = require('os').cpus().length ;

    // All workers
    const workers = [] ;

    // Create two workers for each CPU
    for( var i = 0 , len = cpuCount * 2 ; i < len ; i++ )
        workers.push( cluster.fork() ) ;

    // Listen for dying workers
    cluster.on( 'exit' , ( worker , code , signal ) => {
        // Replace the dead worker, we're not sentimental
        console.log( 'Worker %d died' , worker.id ) ;

        // Remove died worker from list
        workers.splice( workers.indexOf( worker ) , 1 ) ;

        if( code != 0 )
 	    	workers.push( cluster.fork() ) ;
    }) ;

    process.on( 'SIGUSR1', () => {
	    console.log( 'Master %d catch USR1 stop signal !' , process.pid ) ;

	    // Stop all workers
	    workers.forEach( ( worker ) => worker.send( 'STOP_UNIT' ) ) ;
	});
} 
	else // Code to run if we're in a worker process
{
	process.on( 'message', ( message ) => {
		if( message != 'STOP_UNIT' )
			return ;

	    console.log( 'Worker %d/%d catch stop signal from master !' , cluster.worker.id , process.pid ) ;
	    process.exit() ;
	});

	// Fibonacci recursive
	function fibRecursive( n )
	{
		if ( n < 0 )
	    	return -1 ;
		
		if ( n < 2 )
	    	return n ;
		
		return ( fibRecursive( n - 1 ) + fibRecursive( n - 2 ) ) ;
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

		res.write( "Worker id & pid  : " + cluster.worker.id + "#" + process.pid + "<br />" ) ;
		res.write( "Fibonacci entry  : " + entryFib + "<br />" ) ;
		res.write( "Fibonacci result : " + fibRecursive( entryFib ) + "<br />" ) ;

		res.write( "<script type=\"text/javascript\">" ) ;
		res.write( "    document.write( \"Execution : \" + ( new Date() - start ) + \"ms \" ) ;" ) ;
		res.write( "</script>" ) ;

		res.end() ;
	}) ;

    // Start web-server
	app.listen( 1234 , () => 
		console.log( 'Worker %d/%d running !' , cluster.worker.id , process.pid )
	) ;
}