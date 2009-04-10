import com.transfusionmedia.utils.*
import com.transfusionmedia.mvc.*;

/**
* Provides basic services for an MVC view
* 
* @author Warren Benedetto <warren@transfusionmedia.com>
*/

class com.transfusionmedia.mvc.AbstractView implements Observer, View {
	
	/**
	 * Reference to the model
	 */
	private var model:Observable;
	
	/**
	 * Reference to the controller
	 */
	private var controller:Controller;
	
	/**
	 * Constructor
	 * 
	 * @param	model				The model which the view will render
	 * @param	controller			The controller that receives events from the view and updates the model
	 */
	public function AbstractView(theModel:Observable, controller:Controller) {
		
		Trace.header('AbstractView constructed');
	
		/* Set the model */
		setModel(theModel);
		
		/* If a controller was supplied, use it */
		if (controller !== undefined) {
			setController(controller);
		}
	}
	
	/**
	 * Returns the default controller for this view
	 */
	public function defaultController(theModel:Observable):Controller {	
		return null;
	}
	
	/**
	 * Sets the model this view is observing
	 * 
	 * @param	theModel		The model being observed
	 */
	public function setModel(theModel:Observable):Void {
		model 					= theModel;
	}
	
	/**
	 * Returns the model this view is observing
	 * @return					The model being observed
	 */
	public function getModel():Observable {
		return model;
	}
	
	/**
	 * Sets the controller for this view
	 * @param	theController	The controller
	 */
	public function setController(theController:Controller):Void {
		controller				= theController;

		/* Tell controller that this object is its view */
		getController().setView(this);
	}
	
	/**
	 * Returns this view's controller
	 * @return					The controller
	 */
	public function getController():Controller {
		/**
		 * If a controller hasn't been defined, create one.
		 */
		if (controller === undefined) {
			setController(defaultController(getModel()));
		}
		return controller;
	}
	
	/**
	 * Empty implementation of the Observer interface's update() method.
	 * 
	 * @param	observable
	 * @param	infoObject
	 */
	public function update(observable:Observable, infoObject:Object):Void {
		/* Subclasses of AbstractView should provite a concrete implementation
		 * of this method. */
	}
}