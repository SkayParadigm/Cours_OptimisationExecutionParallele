// Le middleware express.js
const express = require('express') ;

// Le module de communication réseau
const net = require('net') ;

// Instance de l'application express
const app = express() ;

// Ressources statiques (javascript, css, ...)
app.use( express.static( 'static' ) ) ;

// Demande de sauvetage web-service
app.get( '/ws/rescue-me/:firstname/:gender/:age/json' , ( req , res ) => {

	// La réponse à l'appel du web-service
	const response = {} ;

	// Création du socket client
	const client = new net.Socket() ;

	// On ce connecte et envoi notre demande de sauvetage
	client.connect( 3333 , '127.0.0.1', () => 
		client.write( req.params.firstname + ';' + req.params.gender + ';' + req.params.age + '\n' ) 
	) 

	// En cas d'erreur
	.on( 'error' , (e) => {
		response.status = 'error' ;
		client.destroy() ;
	}) 

	// Réception des données de la part du serveur
	.on( 'data' , ( data ) => {

		if( typeof response.data != 'object' )
			response.data = [] ;

		response.data.push( data.toString() ) ;
	}) 

	// Déconnexion du socket
	.on( 'close' , () => {
	    res.setHeader( 'Content-Type', 'application/json; charset=utf-8' ) ;
	    res.send( response ) ;
	}) ;
}) ;

// Demande d'arrêt
app.get( '/ws/stop/json' , ( req , res ) => {
	// Statut de la réponse
	var response_status = 0 ;

	// Création du socket client
	const client = new net.Socket() ;

	// On ce connecte et envoi notre demande de sauvetage
	client.connect( 3333 , '127.0.0.1', () => 
		client.write( 'YOU CAN STOP\n' ) 
	) 

	// En cas d'erreur
	.on( 'error' , (e) => {
		response_status = -1 ;
		client.destroy() ;
	}) 

	// Réception des données de la part du serveur
	.on( 'data' , ( data ) => {
		if( data.toString() == ' >> OK\n' )
			response_status = 1 ;
		client.destroy() ;
	}) 

	// Déconnexion du socket
	.on( 'close' , () => {
	    res.setHeader( 'Content-Type', 'application/json; charset=utf-8' ) ;
	    res.send({ 'status' : ( response_status == 1 ? 'done' : 'error' ) }) ;
	}) ;
}) ;

// Démarrage du client
app.listen( 8888 , () => 
    console.log( 'Client app listening on port 8888 !' ) 
) ;