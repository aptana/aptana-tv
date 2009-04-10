/**
 * Utility logging class for outputting trace messages
 * 
 * @author Warren Benedetto <warren@transfusionmedia.com>
 */
class com.transfusionmedia.utils.Trace {
	
	public function Trace() {
		
	}
	
	/**
	 * Outputs an ALL CAPS header wrapped in double divider lines
	 * 
	 * @param	headerText The text to add to the header
	 */
	public static function header(headerText:String) {
		trace('\n\n+=========================================')
		trace('| '+headerText.toUpperCase());
		trace('+=========================================');
	}
	
	/**
	 * Outputs a message followed by a divider line
	 * 
	 * @param	messageText The message text to output
	 */
	public static function message(messageText:String):Void {
		trace('| '+messageText);
		trace('+-----------------------------------------');
	}
	
	/**
	 * Creates a key:value list from an array, followed by a divider line
	 * 
	 * @param	theList Array of items to list
	 */
	public static function list(theList:Object) {
		
		/* Loop through array and output key: value list */
		for (var key:String in theList) {
			trace('|\t' + key + ':\t\t\t' + theList[key]);
		}
		trace('+-----------------------------------------');
	}
}