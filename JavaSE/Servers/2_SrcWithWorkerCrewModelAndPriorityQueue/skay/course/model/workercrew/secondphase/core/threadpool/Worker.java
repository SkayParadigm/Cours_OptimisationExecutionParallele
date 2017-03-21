package skay.course.model.workercrew.secondphase.core.threadpool;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import skay.course.model.workercrew.common.tools.DateUtils;

/**
 * Travailleur
 *  
 * @author Skaÿ <public_code@skay.me>
 */
public final class Worker implements Runnable
{
	// Référence vers le thread pool
    final ThreadPool threadPool ;
    
    // Référence vers l'indicateur de traitement
    final AtomicInteger counter ;
    
    // Référence vers la liste de travailleur
    final List<Worker> workerList ;

    // Objet sémaphore
    final Object lock ;
    
    // Constructeur
    public Worker( final ThreadPool threadPool , final AtomicInteger counter , final List<Worker> workerList , final Object lockOp )
    {	
        this.threadPool = threadPool ;
        this.counter    = counter    ;
        this.workerList = workerList ;
        this.lock       = lockOp     ;
    } ;

    /**
     * Corps d'execution du travailleur
     * */
    @Override
    public void run()
    {
    	// On attente temps que le thread pool n'est pas démarré
    	while( !this.threadPool.started() )
    		try
    		{
    			Thread.sleep( 50 ) ;
    		}
    		catch( final InterruptedException e ){}
    	
    	System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ System >> Worker started (" + Thread.currentThread().getId() + "#" + Thread.currentThread().hashCode() + ")" ) ;
    	
    	// Tant qu'on ne demande pas l'arrêt du thread pool et qu'en plus la liste des tâches en attente de traitement n'est pas vide
        while( true )
        {
        	if( this.threadPool.receivedStopRequest() && this.threadPool.getWaitingJobsCount() == 0 )
        		break ;
        	
        	// Récupération du prochain job
        	final PrioritizedJobAction pAction = threadPool.consume() ;
        	
            // Si un job est disponible alors on l'exécute
            if ( pAction != null && pAction.getJob() != null )
            {
            	// On indique qu'un job est actuellement en cours de traitement
            	synchronized( counter )
            	{
            		counter.incrementAndGet() ;
            	}
            	
            	try
            	{
            		// On consomme le job
                	pAction.getJob().apply()  ;
            	}
            	catch( final Exception e )
            	{
            		System.err.println( DateUtils.getCurrentDateFormattedForLog() + " ++ System >> Worker (" + Thread.currentThread().getId() + "#" + Thread.currentThread().hashCode() + ") fatal error occurred (" + e.getClass().getSimpleName() + ") on job (" + pAction.getJob().getClass().getSimpleName() + ") !" ) ;
            		e.printStackTrace();
            	}
            	
            	// On soustrait l'execution du job précédemment traité au nombre de ceux en cours de traitement
        		synchronized( counter )
            	{
            		counter.decrementAndGet() ;
            	}
            }
        }
        
        synchronized( this.workerList )
        {
	        // On s'auto-supprime de la liste des travailleurs
	        this.workerList.remove( this ) ;
	
	    	// On informe la fin du worker
	    	System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ System >> Worker ended (" + Thread.currentThread().getId() + "#" + Thread.currentThread().hashCode() + "). " + ( this.workerList.size() > 0 ? ( this.workerList.size() + " worker" + ( this.workerList.size() > 1 ? "s" : "" ) + " still running..." ) : "No more worker !" ) ) ;
        }
    }
}