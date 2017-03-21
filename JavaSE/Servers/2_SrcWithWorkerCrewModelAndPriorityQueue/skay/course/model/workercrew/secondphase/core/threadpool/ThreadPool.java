package skay.course.model.workercrew.secondphase.core.threadpool;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import javax.script.ScriptException;

import skay.course.model.workercrew.common.tools.DateUtils;
import skay.course.model.workercrew.secondphase.Settings;

/**
 * Gestionnaire du ThreadPool.
 * 
 * @author Skaÿ <public_code@skay.me>
 */
public final class ThreadPool
{
	// Sémaphore
    final private Object lock = new Object() ;
    
    // Demande d'arrêt de l'ensemble des threads à la fin de leurs traitements en cours
    final private AtomicBoolean shouldStop = new AtomicBoolean( false ) ;
    
    // Indice de démarrage des traitements des jobs 
    final private AtomicBoolean started = new AtomicBoolean( false ) ;
    
    // Queue ordonnée avec des actions priorisées en spécifiant la méthode de comparaison
    final private Queue<PrioritizedJobAction> jobs = new PriorityQueue<PrioritizedJobAction>( ACTION_COMPARATOR_JOB ) ;
    
    // Liste des travailleurs
    final private List<Worker> workers = new ArrayList<Worker>() ;

    // Design Pattern Singleton pour n'avoir qu'un seul ThreadPool
    private static ThreadPool _INSTANCE = null ;
    
    // Nombre de worker
    final public int workerCount ;
    
    // Nombre de tâche en cours
    final private AtomicInteger currentExecJobCounter = new AtomicInteger( 0 ) ;
    
    /**
     * Instance unique du Thread Pool
     * @throws ScriptException 
     * @throws InvalidParameterException 
     * */
    public static ThreadPool get()
    {
    	try
    	{
    		if( _INSTANCE == null )
        		_INSTANCE = new ThreadPool() ;	
    	}
    	catch( final Exception e )
    	{
    		_INSTANCE = null ;
    	}
    	
    	return _INSTANCE ;
    } ;
    
    /**
     * Constructeur initialisant et lançant les travailleurs
     * @throws ScriptException 
     * */
    private ThreadPool()
    {
    	// Nombre de travailleur (worker)
    	workerCount = Settings.TP_WORKER_PER_CORE * Runtime.getRuntime().availableProcessors()  ;
    	
    	for( int i = 0 ; i < workerCount ; i++ )
        {
        	// Création d'un travailleur
        	final Worker w = new Worker( this , currentExecJobCounter , workers , lock ) ;
        	
        	// On attache au fil d'execution le travailleur
            final Thread t = new Thread( w ) ;
            
            // Ajout de la référence du travailleur à la liste
            workers.add( w ) ;
            
            // Démarrage du travailleur
            t.start() ;
        } ;
        
        System.out.println( DateUtils.getCurrentDateFormattedForLog() + " ++ System >> " + workerCount + " worker(s) has been created and launched..." ) ;
    } ;
    
    /**
     * Comparateur d'importance des niveaux de priorités pour les tâches
     * */
    public final static Comparator<PrioritizedJobAction> ACTION_COMPARATOR_JOB = new Comparator<PrioritizedJobAction>()
    {
        @Override
        public int compare( final PrioritizedJobAction pa1, final PrioritizedJobAction pa2  )
        {
        	if( pa1 == null || pa2 == null )
        		return 0 ;
            return (int) pa1.getPriority() - pa2.getPriority() ;
        } ;
    } ;
    
    /**
     * Méthode d'ajout de job avec une priorité spécifique
     * */
    public ThreadPool submit( final int priority, IJob action )
    {
        submit( new PrioritizedJobAction( priority , action ) ) ;
        return this ;
    } ;

    /**
     * Méthode d'ajout de job avec une priorité lambda
     * */
    public ThreadPool submit( final IJob action )
    {
        submit( new PrioritizedJobAction( 0 , action ) ) ;
        return this ;
    } ;

    /**
     * Ajout de l'action priorisée composée du job et de la priorité
     * */
    private ThreadPool submit( final PrioritizedJobAction job )
    {
        synchronized( lock )
        {
        	/**
        	 * Ajout du job à la liste des jobs.
        	 * Aucune différence entre offer et add (voir le code source de la classe).
        	 */
            jobs.add( job ) ;
            
            // Réactive le travailleur le plus vieux en attente
            lock.notify();
        } ;
        
        return this ;
    } ;

    /**
     * Retourne le prochain job disponible et patiente s'il n'y en a pas dans la stack.
     * Bloquant.
     * */
    public PrioritizedJobAction consume()
    {
    	return this.consume( true ) ;
    } ;
    
    /**
     * Retourne le prochain job disponible.
     * @param wait Spécifie si on attends ou pas en cas d'absence de job. En gros détermine si la méthode est bloquante ou non.
     * */
    public PrioritizedJobAction consume( final boolean wait )
    {
        synchronized( lock )
        {
        	// Tant qu'aucun job n'est disponible on attends (ormi si wait est à false dans ce cas on bipasse cette vérification)
            while( wait && jobs.isEmpty() && !this.shouldStop.get() )
            	try
                {	
            		// Attends qu'un autre thread débloque l'objet.
            		// On gros patiente pour l'ajout d'un job dans la liste ou qu'une commande d'arrêt soit reçu
                    lock.wait() ;
                }
            	catch ( InterruptedException e ) {}

            // Récupère le prochain job et le supprime de la liste
            return jobs.poll() ;
        } 
    } ;

    /**
     * Demande de traitement des jobs
     * */
    public ThreadPool start()
    {
    	// Place l'indicateur à true pour indiquer que le thread pool démarre
        this.started.set( true ) ;
        
        return this ;
    } ;
    
    /**
     * Indice de lancement
     * */
    public boolean started()
    {
    	return this.started.get() ;
    } ;

    /**
     * Demande l'arrêt de tous les travailleurs
     * */
    public ThreadPool stopRequest()
    {
        synchronized( lock )
        {
        	// Place l'indicateur à true pour indiquer la demande d'arrêt
            this.shouldStop.set( true ) ;

            // On prévient tous les workers
            lock.notifyAll() ;
        } ;
        
        return this ;
    } ;
    
    /**
     * Indice d'arrêt
     * */
    public boolean receivedStopRequest()
    {
    	return this.shouldStop.get() ;
    } ;
    
    /**
     * Retourne le nombre de job restant en attente
     * */
    public int getWaitingJobsCount()
    {
    	synchronized( this.jobs )
    	{
    		return this.jobs.size() ;
    	}
    } ;
    
    /**
     * Retourne le nombre de job en cours de traitement
     * */
    public int getCurrentExecJobsCount()
    {
    	synchronized( this.currentExecJobCounter )
    	{
    		return this.currentExecJobCounter.get() ;
    	}
    } ;
} ;