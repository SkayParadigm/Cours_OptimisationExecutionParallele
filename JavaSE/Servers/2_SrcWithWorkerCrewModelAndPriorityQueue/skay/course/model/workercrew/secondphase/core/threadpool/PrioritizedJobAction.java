package skay.course.model.workercrew.secondphase.core.threadpool;

/**
 * Classe représentant une action (avec indice de prioritisation)
 * 
 * @author Skaÿ <public_code@skay.me>
 * */
public final class PrioritizedJobAction implements Comparable<Object>
{
    private int priority;
    private IJob action ;

    public PrioritizedJobAction( final int priority, final IJob action )
    {
        this.priority = priority ;
        this.action   = action   ;
    } ;

    public IJob getJob()
    {
    	return this.action ;
    } ;
    
    public int getPriority()
    {
    	return this.priority ;
    } ;
    
    public int compareTo( final Object o )
    {
        if( o != null && o instanceof PrioritizedJobAction )
            return this.priority - ( ( PrioritizedJobAction ) o ).priority ;
        else
            return 1 ;
    } ;
    
    @Override
    public String toString()
    {
    	return this.action.getName() + " with " + this.priority + " priority level" ;
    } ;
} ;