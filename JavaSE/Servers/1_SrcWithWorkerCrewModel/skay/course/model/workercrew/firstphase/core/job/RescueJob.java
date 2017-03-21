/**
 * 
 */
package skay.course.model.workercrew.firstphase.core.job;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.net.Socket;

import skay.course.model.workercrew.common.tools.DateUtils;
import skay.course.model.workercrew.firstphase.core.threadpool.IJob;

/**
 * Job de sauvetage des invités.
 * 
 * @author Skaÿ <public_code@skay.me>
 */
public final class RescueJob implements IJob
{
	final Socket         sock  ;
	final BufferedReader read  ;
	final BufferedWriter write ;
	final String         name  ;
	
	/**
	 * Constructeur unique.
	 * */
	public RescueJob( final Socket sock , final BufferedReader reader , final BufferedWriter writer , final String firstName )
	{
		this.sock  = sock      ; // Socket du client
		this.read  = reader    ; // Lecteur du flux entrant
		this.write = writer    ; // Rédacteur sur le flux sortant
		this.name  = firstName ; // Prénom 
	}
	
	/**
	 * Corps de traitement de la demande de sauvetage
	 * */
	@Override
	public void apply()
	{
		// On attends une seconde
		try { Thread.sleep(1000); } catch( Exception e ){}
		
		// Traitement de la demande
		try
		{
			// On indique au client qu'il est sauvé
			this.write.write( " >> You're safe !\n" ) ;
			this.write.flush() ;
			
			System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ RescueJob >> " + this.name + " is rescued !" ) ;
		}
		catch( final Exception e )
		{
			System.err.println( DateUtils.getCurrentDateFormattedForLog() + " ++ RescueJob >> Error occurred !" ) ;
			
			e.printStackTrace() ;
		}
		finally
		{
			// On ferme le flux entrant
			try { read.close() ; } catch( Exception e ){}
			
			// On ferme le flux sortant
			try { write.close() ; } catch( Exception e ){}
			
			// On ferme le socket
			if( !sock.isClosed() )
				try { sock.close() ; } catch( Exception e ){}
		}
		
		// On attends une seconde
		try { Thread.sleep(1000); } catch( Exception e ){}
	}

	@Override
	public String getName()
	{
		return getClass().getName().substring( 0 , getClass().getName().indexOf( "$" ) ) ;
	}
}