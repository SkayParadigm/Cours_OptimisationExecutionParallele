'use strict' ;

// Un noeud
function Node( data ){
	this.data = data ;
	this.next = null ;
} ;

// Une liste chainée
function LinkedList() {
    this._head = null ;
    this._size = 0    ;
} ;

// Est vide ?
LinkedList.prototype.isEmpty = function(){
    return this._size === 0 ;
} ;

// Nombre d'éléments dans la liste chainée
LinkedList.prototype.size = function(){
    return this._size ;
} ;

// Récupération du première élément de la liste et suppression de ce dernier de la liste
LinkedList.prototype.poll = function(){
	const first = this._head ;
	
	if( this._head != null )
	{
		this._head = this._head.next ;
		this._size-- ;
	}

    return ( first != null ? first.data : null ) ;
} ;

// Récupération du première élément de la liste sans pour autant le supprimer
LinkedList.prototype.getFirst = function(){
	return ( this._head != null ? this._head.data : null ) ;
} ;

// Ajout d'un élément dans la liste
LinkedList.prototype.add = function( data ){
    const newNode = new Node( data ) ;

	if( this._head == null )
		this._head = newNode ;
	else
	{
		var el = this._head ;

		while( el.next != null && ( el = el.next ) != null ) ;

		el.next = newNode ;
	}

	this._size++ ;

	return this ;
} ;

// Exportation du module
var exports = module.exports = LinkedList ;