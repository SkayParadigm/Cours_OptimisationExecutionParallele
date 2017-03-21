/**
 * 
 */
package skay.course.model.workercrew.base;

import java.util.regex.Pattern;

/**
 * Classe contenant tous les paramètres de l'application.
 * 
 * @author Skaÿ <public_code@skay.me>
 */
public final class Settings
{	
	/**
	 * Formatage des dates
	 * */
	final static public String SDF_LOG_OUTPUT = "dd/MM/yy HH:mm:ss.SSS" ;
	
	/**
	 * Serveur TCP
	 * */
	final static public int SERVER_PORT = 3333 ; // Port d'écoute du serveur
	
	/**
	 * Expressions régulières de l'application
	 * */
	final static public Pattern PATTERN_PIDHOST_APP    = Pattern.compile( "^([1-9][0-9]*)@(.+)$" ) ; // Formation d'un pid et hostname retourné par la JVM
	final static public Pattern PATTERN_GUEST_IDENTITY = Pattern.compile( "^([A-Za-z]{2,});([FfMm]);([0-9]{1,3})$" ) ; // Invité
	final static public Pattern PATTERN_QUIT_COMMAND   = Pattern.compile( "^YOU CAN STOP$" ) ; // Demande d'arrêt
} ;