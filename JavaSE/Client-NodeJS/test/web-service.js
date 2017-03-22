'use strict' ;

const chai    = require( 'chai' )      ; 
const chainet = require( 'chai-http' ) ;
const expect  = chai.expect ;
const assert  = chai.assert ;

chai.should() ;

chai.use( chainet ) ;

const agent = chai.request( 'http://127.0.0.1:8888' ) ;

describe( 'Web-Service' , () => {

	describe('Rescue request', () => {
	    
	    it('Woman, 23 years old', (done) => {
	    	agent
	    		.get( '/ws/rescue-me/Sophie/f/23/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('data');
	    			assert.equal( 2 , res.body.data.length ) ;
	    			assert.equal( res.body.data[ 0 ] , ' >> Sophie please wait...\n' ) ;
	    			assert.equal( res.body.data[ 1 ] , ' >> You\'re safe !\n' ) ;

	    			done() ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
	    }) ;
	    
	    it('Men, 27 years old', (done) => {
	    	agent
	    		.get( '/ws/rescue-me/Adam/m/27/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('data');
	    			assert.equal( 2 , res.body.data.length ) ;
	    			assert.equal( res.body.data[ 0 ] , ' >> Adam please wait...\n' ) ;
	    			assert.equal( res.body.data[ 1 ] , ' >> You\'re safe !\n' ) ;

	    			done() ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
	    }) ;

	    it('Children (13 years old)', (done) => {
	    	agent
	    		.get( '/ws/rescue-me/Lisa/f/13/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('data');
	    			assert.equal( 2 , res.body.data.length ) ;
	    			assert.equal( res.body.data[ 0 ] , ' >> Lisa please wait...\n' ) ;
	    			assert.equal( res.body.data[ 1 ] , ' >> You\'re safe !\n' ) ;

	    			done() ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
	    }) ;

	}) ;

	describe('Bad request', () => {
	    it('Bad gender', (done) => {
	    	agent
	    		.get( '/ws/rescue-me/Adam/X/27/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('data');
	    			assert.equal( res.body.data , ' >> Bad request !\n' ) ;

	    			done() ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
	    }) ;

	    it('Bad name', (done) => {
	    	agent
	    		.get( '/ws/rescue-me/4534/F/27/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('data');
	    			assert.equal( res.body.data , ' >> Bad request !\n' ) ;

	    			done() ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
	    }) ;
	}) ;

	describe( 'Quit command' , () => {
		it('Stop request over network call', (done) => {
			agent
	    		.get( '/ws/stop/json' )
	    		.send()
	    		.then( ( res ) => {
	    			expect(res).to.have.status(200); // http code ok
	    			expect(res).to.be.json ; // json format
	    			res.body.should.be.a('object') ;
	    			res.body.should.have.property('status');
	    			expect( res.body.status ).not.to.be.null ;
	                expect( res.body.status ).to.not.be.empty ;
	                res.body.status.should.be.a('string') ;
	                res.body.status.should.equal('done') ;
	    		})
	    		.then( (res) => {
	    			return agent.get( '/ws/rescue-me/Lisa/f/13/json' )
	    				.send()
	    				.then( ( res ) => {
							expect(res).to.have.status(200); // http code ok
			    			expect(res).to.be.json ; // json format
			    			res.body.should.be.a('object') ;

			    			return agent
			    				.get( '/ws/rescue-me/Lisa/f/13/json' )
	    						.send()
	    					;
	    				})
	    				.then( ( res ) => {
	    					expect(res).to.have.status(200); // http code ok
			    			expect(res).to.be.json ; // json format
			    			res.body.should.be.a('object') ;
			    			res.body.should.have.property('status');
			    			expect( res.body.status ).not.to.be.null ;
			                expect( res.body.status ).to.not.be.empty ;
			                res.body.status.should.be.a('string') ;
			                res.body.status.should.equal('error') ;
			                done() ;
	    				})
	    				.catch( (e) => done(e) ) ;
	    		})
	    		.catch( (e) => done(e) )
	    	;
		}) ;
	}) ;
}) ;
