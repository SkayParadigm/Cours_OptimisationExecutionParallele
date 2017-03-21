package skay.course.model.workercrew.firstphase.core.threadpool;

/**
 * Interface à implémenter pour tout les jobs 
 * 
 * @author Skaÿ <public_code@skay.me>
 * */
public interface IJob
{
	/**
	 * Corps d'execution du job.
	 * @Note Ne pas oublier, pour les gros traitements d'insérer des Thread.yield() !
	 * */
    void apply() ;
    
    /**
     * Retourne le nom du job
     * */
    String getName() ;
} ;