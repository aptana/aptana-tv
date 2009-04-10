import com.transfusionmedia.utils.*
import com.transfusionmedia.mvc.*;

/**
* Provides basic services for an MVC controller
* 
* @author Warren Benedetto <warren@transfusionmedia.com>
*/

class com.transfusionmedia.mvc.AbstractController implements Controller {
	
	/**
	 * Reference to the model
	 */
	private var model:Observable;
	
	/**
	 * Reference to the view
	 */
	private var view:View;
	
	/**
	 * Constructor
	 */
	public function AbstractController(theModel:Observable) {
		Trace.header('AbstractController constructed');
		setModel(theModel);
	}
	
	/**
	 * Sets the model for this controller
	 * @param	theModel		The model for this controller
	 */
	public function setModel(theModel:Observable):Void {
		model				= theModel;
	}
	
	/**
	 * Gets the model for this controller
	 * @return					The model for this controller
	 */
	public function getModel():Observable {
		return model;
	}
	
	/**
	 * Sets the view that this controller is servicing
	 * @param	theView			The view this controller is servicing
	 */
	public function setView(theView:View):Void {
		view				= theView;
	}
	
	/**
	 * Gets this controller's view
	 * @return					This controller's view
	 */
	public function getView():View {
		return view;
	}
}