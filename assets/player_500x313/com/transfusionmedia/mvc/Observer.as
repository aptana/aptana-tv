import com.transfusionmedia.mvc.Observable;

/**
* ...
* @author Default
*/

interface com.transfusionmedia.mvc.Observer {
	
	/**
	 * Invoked by an observed object when it changes
	 * 
	 * @param	observable			The observed object (an instance of Observable)
	 * @param	infoObject			Data object sent by the observed object
	 */
	public function update(observable:Observable, infoObject:Object):Void;
	
}