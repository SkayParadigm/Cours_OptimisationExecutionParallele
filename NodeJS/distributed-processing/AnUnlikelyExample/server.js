'use strict' ;

// Inclusion du module cluster
const cluster = require( 'cluster' ) ;

// Inclusion du module de création et gestion d'une liste chainée
const LinkedList = require( './Linkedlist.js' ) ;

// Inclusion du module relative à une demande de calcul
const Request = require( './Request.js' ) ;

// Bloc de code pour le processus master
if( cluster.isMaster )
{
	console.log( 'Master %d running!' , process.pid ) ;

    // Module de génération d'UUID v1 et v4
    const uuid = require( 'uuid' ) ;

    // Middleware web
    const express = require( 'express' ) ;

    // Instance d'express
    const app = express() ;

    // Traitement lié à la réception de message des workers
    const workerProcessInputMessage = ( message ) => {
        if( typeof message != 'object' || typeof message.requestId != 'string' || typeof request[ message.requestId ] != 'object' )
            return ;

        console.log( 'Received result from %d worker for %s entry !\n' , message.workerPid , message.requestId , message ) ;

        // Mise à jour d'un groupe avec le résultat
        request[ message.requestId ].updateGroup( message.operation , message.result , message.workerPid ) ;

        // Si l'ensemble des groupes de la formule ont été calculé
        if( request[ message.requestId ].isComplete() )
            request[ message.requestId ].complete() ; // On appel le(s) callback(s)
    } ;

    // Nombre de cpus dont dispose la machine
    const cpuCount = require('os').cpus().length ;

    // Liste des workers allant être créés
    const workers = [] ;

    // Création de deux workers pour chaque coeur
    for( var i = 0 , len = cpuCount * 2 ; i < len ; i++ )
    {
        workers.push( cluster.fork() ) ;
    
        // On indique qu'on se met en écoute sur les messages
        // provenant du worker fraichement créé
        workers[ workers.length - 1 ].on( 'message' , workerProcessInputMessage ) ;
    }

    // On surveille l'arrêt des workers
    cluster.on( 'exit' , ( worker , code , signal ) => {
        // On indique qu'un worker s'est arreté
        console.log( 'Worker %d died' , worker.id ) ;

        // On supprime la référence sur le worker dans la liste
        workers.splice( workers.indexOf( worker ) , 1 ) ;

        // Si l'arrêt est prématuré alors on recrée et ajoute à la liste un worker
        if( code != 0 )
 	    	workers.push( cluster.fork() ) ;
    }) ;

    // On surveille les demandes d'arrêt
    process.on( 'SIGUSR1', () => {
	    console.log( 'Master %d catch USR1 stop signal !' , process.pid ) ;

	    // On demande à tous les workers connus de s'arrêter
	    workers.forEach( ( worker ) => worker.send({ type: 'command' , command: 'stop' }) ) ;
	}) ;

    // Les requêtes reçues
    const request = {} ;

    // Indice du dernier worker auquel on a envoyé une demande de traitement
    // Pour l'usage du Round-Robin
    var workerIndex = -1 ;

    // Web-service de réception des traitements à effectuer
    app.get( /^\/ws\/(.+)\/json$/ , ( req , res ) => {
        // Identifiant unique du traitement
        var id = null ;

        while( typeof request[ ( id = uuid.v4() ) ] == 'object' ) ;

        // On formule une nouvelle requête avec le callback
        request[ id ] = new Request( id , req.params[0] , ( expression ) => {
            res.setHeader( 'Content-Type' , 'application/json; charset=utf8' ) ;
            res.send( expression.toJSON() ) ;
        }) ;

        // Retourne les groupes liés à l'expression reçue
        const clusterGroup = request[ id ].getClusterGroup() ;

        // On envoie aux workers en round-robin
        for( var i = 0 ; i < clusterGroup.length ; i++ )
            workers[ ++workerIndex >= workers.length ? workerIndex%workers.length : workerIndex ].send({
                type: 'compute' ,
                operation : clusterGroup[ i ].toString() ,
                requestId : id
            }) ;
    }) ;

    // Ressources statiques
    app.use( express.static( __dirname + '/static' ) ) ;

    // On redirige les autres requêtes...
    app.all( /^.+$/ , ( req , res ) => res.redirect( '/' ) ) ;

    // On démarre le serveur
    app.listen( 8080 , () => console.log( 'Server has started !' ) ) ;
} 
	else // Portion de code pour les "forkés"
{
    // On rajoute la fonction replaceAll sur le prototype String
    String.prototype.replaceAll = function( search , replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement) ;
    } ;

    // Fibonacci récursive (pour que ça prenne du temps...)
    const fibonacci = ( n ) =>
        n == 0 || n == 1 ? n : fibonacci( n - 1 ) + fibonacci( n - 2 ) ;

    // Extraction des fonctions relatives à la suite de fibonacci
    const fiboRegExp = /(fib([0-9]+))/gi ;

    // Liste des expressions reçues
    const list = new LinkedList() ;

    // Effectue les calculs des expressions reçues
    const compute = () => {
        while( !list.isEmpty() )
        {
            // Calcul suivant (et on le supprime de la liste des calculs à effectuer)
            const node = list.poll() ;

            // Normalement il ne peut être nul mais bon on est jamais trop prudent
            if( node == null )
                return ;

            // On vérifie si un fibo est demandé
            if( node.operation.match( fiboRegExp ) != null )
            {
                // Toutes les demandes de calcul
                const fiboGroups = {} ;

                var fiboRequest = null ;

                do
                {
                    fiboRequest = fiboRegExp.exec( node.operation ) ;

                    // S'il n'y a plus de groupes on quitte 
                    if( fiboRequest == null )
                        break ;

                    // Si le groupe a déjà été calculé on le saute
                    if( typeof fiboGroups[ fiboRequest[0] ] == 'number' )
                        continue ;

                    // On calcule le groupe
                    fiboGroups[ fiboRequest[0] ] = fibonacci( fiboRequest[ 2 ] ) ;

                } while( true ) ;

                node.originalOperation = node.operation ;

                // On remplace tous les énoncés par les résultats
                for( var fibo in fiboGroups ) 
                    node.operation = node.operation.replaceAll( fibo , fiboGroups[ fibo ] ) ;
            }
            
            // On calcule et retourne le résultat au master
            process.send({
                workerPid : process.pid            , // Pid du worker courant
                operation : ( typeof node.originalOperation == 'string' ? node.originalOperation : node.operation ) , // Opération demandée
                result    : eval( node.operation ) , // Résultat de l'opération
                requestedDate : node.receivedDate  , // Date de réception de la demande
                requestId : node.requestId         , // Identifiant unique de la requête
                calculated: new Date()               // Date et heure à laquelle fut calculé l'expression
            }) ;
        }

        // On réitère dans 200ms
        setTimeout( compute , 200 ) ;
    } ;

    // Réception d'un message du master
	process.on( 'message', ( message ) => {
		if( typeof message != 'object' || typeof message.type != 'string' )
			return ;

        switch( message.type )
        {
            case 'command' : // Commande relatif au fonctionnement de l'application
                if( message.type == 'stop' ) // Demande d'arrêt
                {
                    console.log( 'Worker %d/%d catch stop signal from master !' , cluster.worker.id , process.pid ) ;

                    // On arrête ce fork avec comme statut "0" pour indiquer qu'il ne s'agit pas d'une erreur.
                    // Et ainsi éviter que le master ne recréer un fork
                    process.exit() ;  
                }
            break ;

            case 'compute' : // Demande de calcule
                console.log( 'Worker %d/%d received from master an operation : %s' , cluster.worker.id , process.pid , message.operation ) ;
            
                // On ajoute le calcul à la liste des calculs à effectuer.
                list.add({
                    receivedDate : new Date() ,
                    operation    : message.operation ,
                    requestId    : message.requestId
                }) ;
            break ;

            default : break ; // On ignore tous les autres messages..
        } ;
	}) ;

    // On lance la surveillance des calculs à effectuer
    compute() ;
}