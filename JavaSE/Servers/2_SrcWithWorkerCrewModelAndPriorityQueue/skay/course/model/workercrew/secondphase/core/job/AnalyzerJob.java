/**
 * 
 */
package skay.course.model.workercrew.secondphase.core.job;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.regex.Matcher;

import skay.course.model.workercrew.common.tools.DateUtils;
import skay.course.model.workercrew.secondphase.Application;
import skay.course.model.workercrew.secondphase.Settings;
import skay.course.model.workercrew.secondphase.core.threadpool.IJob;
import skay.course.model.workercrew.secondphase.core.threadpool.ThreadPool;

/**
 * Job d'analyse des requêtes entrantes.
 * 
 * @author Skaÿ <public_code@skay.me>
 */
public final class AnalyzerJob implements IJob
{
	// Socket client
	final private Socket socket ;
	
	/**
	 * Constructeur unique
	 * */
	public AnalyzerJob( final Socket client )
	{
		// Sauvegarde du socket
		this.socket = client ;
		
		System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Request received from " + client.getInetAddress() + " !" ) ;
	} ;
	
	/**
	 * Corps du traitement de la requête reçu.
	 * */
	@Override
	public void apply()
	{
		boolean needToClose = false ;
		
		BufferedReader reader = null ;
		BufferedWriter writer = null ;
		
		try
		{
			// Buffer pour la lecteur du flux entrant
			reader = new BufferedReader( new InputStreamReader( socket.getInputStream() , "UTF-8" ) ) ;
			
			// Buffer pour l'écriture sur le flux sortant
			writer = new BufferedWriter( new OutputStreamWriter( new DataOutputStream( socket.getOutputStream() ) , "UTF-8" ) ) ;
			
			// Récupération du prénom, du sexe et de l'âge du client
			final String guestIdentity = reader.readLine().trim() ;
			
			// Matcher
			Matcher guestDatas ;
			
			// S'il s'agit d'une demande d'arrêt
			if( Settings.PATTERN_QUIT_COMMAND.matcher( guestIdentity ).matches() )
			{
				// On demande l'arrêt de tous les travailleurs.
				Application.STOP_REQUEST_PROCESS.handle( null ) ;
				
				// On indique au client que la requête a correctement été effectuée
				writer.write( " >> OK\n" ) ;
				writer.flush() ;
				
				System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Quit request received !" ) ;
				
				// On indique qu'une fermeture des flux et du socket est nécessaire
				needToClose = true ;
				
				// On quit le job
				return ;
			}
			
			// Mauvais format de la requête
			if( !( guestDatas = Settings.PATTERN_GUEST_IDENTITY.matcher( guestIdentity ) ).matches() )
			{
				// On indique qu'il s'agit d'un mauvais format de requête
				writer.write( " >> Bad request !\n" ) ;
				writer.flush() ;
				
				System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Bad request received !" ) ;
				
				// On indique qu'une fermeture des flux et du socket est nécessaire
				needToClose = true ;
				
				// On quit le job
				return ;
			}
			
			// On indique au client d'attendre
			writer.write( " >> " + guestDatas.group(1) + " please wait...\n" ) ;
			writer.flush();
			
			System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ AnalyzerJob >> " + guestDatas.group(1) + " is waiting !" ) ;
			
			// On ajoute la demande avec un statut prioritaire s'il s'agit d'une femme ou d'un mineur sinon à la suite des autres demandes
			ThreadPool.get().submit( ( "f".equalsIgnoreCase( guestDatas.group(2) ) || Integer.parseInt( guestDatas.group(3) ) < 18 ) ? 1 : 0 , new RescueJob( this.socket , reader , writer , guestDatas.group(1) ) ) ;
		}
		catch( final Exception e )
		{
			System.err.println( DateUtils.getCurrentDateFormattedForLog() + " ++ AnalyzerJob >> Error occurred !" ) ;
			
			e.printStackTrace() ;
		}
		finally
		{
			if( needToClose )
			{
				// On ferme le flux entrant
				try { reader.close() ; } catch( Exception e ){}
				
				// On ferme le flux sortant
				try { writer.close() ; } catch( Exception e ){}
				
				// On ferme le socket
				if( !socket.isClosed() )
					try { socket.close() ; } catch( Exception e ){}
			}
		}
	}
	
	@Override
	public String getName()
	{
		return getClass().getName().substring( 0 , getClass().getName().indexOf( "$" ) ) ;
	}
}