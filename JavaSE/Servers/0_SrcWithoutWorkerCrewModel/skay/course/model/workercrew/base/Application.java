package skay.course.model.workercrew.base;

import java.lang.management.ManagementFactory;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;

import skay.course.model.workercrew.base.core.process.AnalyzerRunnable;
import skay.course.model.workercrew.common.tools.DateUtils;
import sun.misc.Signal;
import sun.misc.SignalHandler;

/**
 * Application.
 * 
 * @author Skaÿ <public_code@skay.me>
 */
public final class Application
{
	// Indicateur d'arrêt
	final public static AtomicBoolean STOP_REQUEST = new AtomicBoolean( false ) ;
	
	// Traitement des demandes d'arrêt reçus
	final public static SignalHandler STOP_REQUEST_PROCESS = new SignalHandler()
    {
    	public void handle( final Signal sig )
    	{
    		System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Quit request received !" ) ;
    		
    		STOP_REQUEST.set( true ) ;
	    }
	} ;
	
	/**
	 * Point d'entré de l'application
	 * */
	public static void main( final String[] args ) throws Exception
	{
		System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Base version" ) ;
		   
		// Matcher pour le pid/host retourné par la JVM
		final Matcher matPidHost = Settings.PATTERN_PIDHOST_APP.matcher( ManagementFactory.getRuntimeMXBean().getName() ) ;
		
		if( !matPidHost.matches() )
		{
			System.err.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Error incorrect value received from JVM for pid/host request !" ) ;
			System.exit(1) ;
		}
		
		System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Started with " + matPidHost.group(1) + " pid." ) ;
		   
		// On catch le signal d'arrêt (une des possibilités d'arrêt propre de l'application)
		Signal.handle( new Signal( "USR2" ) , STOP_REQUEST_PROCESS ) ; // SIGUSR2
		Signal.handle( new Signal( "INT"  ) , STOP_REQUEST_PROCESS ) ; // SIGINT
		
		// Création d'un socket serveur. On se met en écoute sur le port désigné.
		final ServerSocket serverSocket = new ServerSocket( Settings.SERVER_PORT ) ;
		
	    System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Listen on " + Settings.SERVER_PORT + " port." ) ;
	   
		// Tant qu'on n'a pas reçu de demande d'arrêt du serveur
		while( !STOP_REQUEST.get() )
		{
			// Socket du client
			final Socket guest = serverSocket.accept() ;

			// On ne traite pas cette requête si une demande d'arrêt a été demandé
			if( STOP_REQUEST.get() )
			{
				// On referme le socket
				if( !guest.isClosed() )
					guest.close() ;
				
				break ;
			}
			
			// On démarre un thread pour effectué le traitement
			new Thread( new AnalyzerRunnable( guest ) ).start();
		}
		
		// On ferme proprement le socket serveur s'il n'est pas déjà fermé (problèmes ayant entrainés une fermeture forcé par exemple)
		if( !serverSocket.isClosed() )
			serverSocket.close() ;
		
		System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ Server >> Closed. Bye !" ) ;
	}
}