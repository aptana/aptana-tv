import com.transfusionmedia.utils.*
import com.transfusionmedia.mvc.*;

/**
* Specifies the minimum methods the MVC framework controller must implement
* 
* @author Warren Benedetto <warren@transfusionmedia.com>
*/

interface com.transfusionmedia.mvc.Controller {
	
	/**
	 * Sets the model for this controller
	 */
	public function setModel(theModel:Observable):Void;
	
	/**
	 * Returns the model for this controller
	 */
	public function getModel():Observable;
	
	/**
	 * Sets the view this controller is servicing
	 */
	public function setView(theView:View):Void;
	
	/**
	 * Returns this controller's view
	 */
	public function getView():View;
}