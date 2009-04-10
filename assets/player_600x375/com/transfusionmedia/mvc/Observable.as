import com.transfusionmedia.utils.*;
import com.transfusionmedia.mvc.Observer;

/**
* Interface used to represent the subject of the Observer design pattern. 
* 
* Observers must implement the Observable interface and register to observe
* the subject via addObserver()
* 
* @author Warren Benedetto <warren@transfusionmedia.com>
*/

class com.transfusionmedia.mvc.Observable {
	
	/**
	 * Indicates whether this object has changed
	 */
	private var changed:Boolean					= false;
	
	/**
	 * Array of observers
	 */
	private var observers:Array;
	
	/**
	 * Constructor
	 */
	public function Observable() {
		Trace.header('Observable constructed');
		observers								= new Array();
	}
	
	/**
	 * Adds a new observer to the list of observers
	 * 
	 * @param	newObserver			The observer to add
	 * @return
	 */
	public function addObserver(newObserver:Observer):Boolean {
				
		/* Prevent addition of null observer */
		if (newObserver == null) {
			return false
		}
		
		/* Loop through exiting observers to make sure this new observer
		 * hasn't already been registered */
		for (var i:Number = 0; i < observers.length; i++) {
			if (observers[i] == newObserver) {
				return false;
			}
		}
		
		/* Register new observer to observers list */
		observers.push(newObserver);
		return true;
	}
	
	/**
	 * Removes an observer from the list of observers
	 * 
	 * @param	observer			The observer to remove
	 * @return
	 */
	public function removeObserver(observer:Observer):Boolean {
		
		for (var i:Number = 0; i < observers.length; i++) {
			if (observers[i] == observer) {
				observers.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Notifies all observers that the subject has changed
	 * 
	 * @param	infoObject			An object containing data to pass to observers
	 */
	public function notify(infoObject:Object):Void {
		
		/* Make info object null if none is supplied */
		if (infoObject == undefined) {
			infoObject = null;
		}
		/* If the subject hasn't changed, don't notify observers */
		if (changed == false) {
			return;
		}
		/* Take a snapshot of the observers array, so it doesn't change during processing */
		var observersSnapshot:Array		= observers.slice(0);
		
		/* Clear changed flag */
		clearChanged();
		
		for (var i:Number = 0; i < observersSnapshot.length; i++) {
			observersSnapshot[i].update(this, infoObject);
		}
	}
	
	/**
	 * Removes all observers from list
	 */
	public function clearObservers():Void {
		observers						= new Array();
	}
	
	/**
	 * Indicates that the subject has changed
	 */
	private function setChanged():Void {
		changed							= true;
	}
	
	/**
	 * Indicates that the subject hasn't changed, or has already notified
	 * its observers of its most recent change
	 */
	private function clearChanged():Void {
		changed							= false;
	}
	
	/**
	 * Checks if the subject has changed
	 * 
	 * @return				True if the subject has changed
	 */
	public function hasChanged():Boolean {
		return changed;
	}
	
	/**
	 * Returns the number of observers in the list
	 * @return				Number of observers
	 */
	public function countObservers():Number {
		return observers.length;
	}
}