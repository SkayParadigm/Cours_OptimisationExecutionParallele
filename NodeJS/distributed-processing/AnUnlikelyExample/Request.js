'use strict' ;

// Expression à calculer
function expression( expression ){
	return {
		expression : expression ,
		processed  : []
	} ;
} ;

// Constructeur
function Request( id , content , callback ){
	this._id            = id           ;
	this._content       = content      ;
	this._callback      = [ callback ] ;
	this._expression    = []           ;
	this._result        = null         ;
	this._alreadySended = false        ;

	var tmp = '' ;

	for( var i = 0, prev = 0 ; i < content.length ; i++ )
	{
	    if( content[i] == ')' )
	    {
	        this._expression.push( expression( tmp ) ) ;

	        tmp = '' ;
	        prev = 1  ;
	    }
	    else
	    if( prev == 1 )
	    {
	        prev = 0 ;
	        this._expression.push( expression( content[i] ) ) ;
	    }
	    else
	    if( content[i] != '(' )
	        tmp += content[i] ;
	}
} ;

// Ajout de callback
Request.prototype.addCallback = function( callback ) {
	this._callback.push( callback ) ;
	return this ;
} ;

// Retourne les groupes à calculer
Request.prototype.getClusterGroup = function(){
	const calc = [] ;

	for( var i = 0 ; i < this._expression.length ; i++ )
		if( i%2 == 0 )
			calc.push( this._expression[i].expression ) ;

	return calc ;
} ;

// Mise à jour d'un groupe à calculer
Request.prototype.updateGroup = function( expression , result , workerPid ){

	var groupCount = 0 ;

	for( var i = 0 ; i < this._expression.length ; i++ )
		// Stoquage du résultat 
		if( this._expression[i].expression === expression && ++groupCount > 0 )
			this._expression[i].processed.push({
				result : result    ,
				worker : workerPid 
			}) ;

	return groupCount ;
} ;

// Indique si tous les calculs de l'expression ont été calculé
Request.prototype.isComplete = function(){
	if( typeof this._result == 'number' ) 
		return this._result ;

	var processedCount = 0 , resultExpression = [] ;

	for( var i = 0 ; i < this._expression.length ; i++ )
		if( this._expression[i].expression.length == 1 )
		{
			resultExpression.push( this._expression[i].expression ) ;
			processedCount++ ;
		}
		else
		if( this._expression[i].processed.length > 0 )
		{
			resultExpression.push( this._expression[i].processed[ 0 ].result ) ;
			processedCount++ ;
		}

	if( processedCount == this._expression.length )
		this._result = eval( resultExpression.join( '' ) ) ;

	return typeof this._result == 'number' ;
} ;

// On appelle tous les callback enregistrés
Request.prototype.complete = function(){
	if( this._alreadySended )
		return this ;

	this._alreadySended = true ;

	for( var i = 0 ; i < this._callback.length ; i++ )
		this._callback[i]( this ) ;

	return this ;
} ;

// Retourne le contenu de la requête au format JSON
Request.prototype.toJSON = function(){
	return {
		id         : this._id      ,
		expression : this._content ,
		result     : this._result  ,
		groups     : this._expression
	} ;
} ;

// Exportation du module
var exports = module.exports = Request ;