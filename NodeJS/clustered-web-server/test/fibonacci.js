'use strict' ;

const chai    = require( 'chai' )      ; 
const chainet = require( 'chai-http' ) ;
const expect  = chai.expect ;
const assert  = chai.assert ;

chai.should() ;

chai.use( chainet ) ;

const regValidator = /Fibonacci entry  : 40<br \/>Fibonacci result : 102334155/ ;

it( 'Valid response (status, fibonacci result, etc.)' , ( done ) => {
	chai
		.request( 'http://127.0.0.1:1234' )
		.get( '/' )
		.send()
		.then( ( res ) => {
			expect(res).to.have.status(200); // http code ok
			expect(res).to.be.html ; // html format
			assert.match( res.text , regValidator ) ;

			done() ;
		})
		.catch( (e) => done(e) )
	;
}) ;
