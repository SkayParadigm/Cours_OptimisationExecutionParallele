package skay.course.model.workercrew.common.tools;

import java.text.SimpleDateFormat;
import java.util.Date;

import skay.course.model.workercrew.secondphase.Settings;

/**
 * Classe utilitaire pour les opérations temporelles
 *  
 * @author Skaÿ <public_code@skay.me>
 */
public final class DateUtils
{
	/**
	 * Renvoi la date actuelle formater selon un SimpleDateFormat spécifié
	 * */
	public static String getCurrentDate( final SimpleDateFormat sdf )
	{
		return sdf.format( new Date() ) ;
	} ;
	
	/**
	 * Renvoi la date pour les logs
	 * */
	public static String getCurrentDateFormattedForLog()
	{
		return "[" + new SimpleDateFormat( Settings.SDF_LOG_OUTPUT ).format( new Date() ) + "]" ;
	}
} ;