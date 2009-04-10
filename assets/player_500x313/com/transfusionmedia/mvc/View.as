import com.transfusionmedia.utils.*
import com.transfusionmedia.mvc.*;

/**
* Specifies the minimum methods the MVC framework view must implement
* 
* @author Warren Benedetto <warren@transfusionmedia.com>
*/

interface com.transfusionmedia.mvc.View {
	
	/**
	 * Set the model this view is observing
	 * 
	 * @param	model			The model being observed
	 */
	public function setModel(theModel:Observable):Void;
	
	/**
	 * Gets the model this view is observing
	 * 
	 * @return					The model being observed
	 */
	public function getModel():Observable;
	
	/**
	 * Sets the controller for this view
	 */
	public function setController(controller:Controller):Void;
	
	/**
	 * Returns this view's controller
	 */
	public function getController():Controller;
	
	/**
	 * Returns the default controller for this view
	 */
	public function defaultController(model:Observable):Controller;
}