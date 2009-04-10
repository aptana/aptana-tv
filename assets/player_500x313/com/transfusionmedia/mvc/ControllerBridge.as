import com.transfusionmedia.mvc.Controller;

/**
 * Facilitates communication between loosely coupled controllers.
 * 
 * Multiple controllers can be registered with an instance of ControllerBridge via
 * addController. Then the ControllerBridge instance is stored in each controller.
 * 
 * When a controller makes a change that it wants to communicate to other controllers,
 * it can call the ControllerBridge update() method. This method takes an infoObject
 * so data can be passed between controllers.
 * 
 * The update function in ControllerBridge loops through all registered controllers and
 * calls an update() method in each of them.
 * 
 * All controllers registered with a ControllerBridge must provide an update() method that
 * accepts an infoObject, so they can receive and process updates from the ControllerBridge.
 * 
 * @author Warren Benedetto <warren@transfusionmedia.com>
 */
class com.transfusionmedia.mvc.ControllerBridge {
	
	/**
	 * Array of Controller objects
	 */
	private var controllers:Array;
	
	/**
	 * The name of this bridge
	 */
	private var bridgeName:String;
	
	/**
	 * Constructor
	 */
	public function ControllerBridge(name:String) {
		
		trace("ControllerBridge");
		trace("-- bridgeName: "+name);
		trace('=================');
		
		/* Initialize member properties */
		controllers 	 	= new Array();
		bridgeName			= name;
	}
	
	/**
	 * Gets the name of this ControllerBridge
	 */
	public function getBridgeName():String {
		
		trace("getBridgeName");
		trace('=================');
		
		return bridgeName;
	}
	
	/**
	 * Adds a controller to the ControllerBridge, making it eligible for updates
	 * from other controllers
	 * 
	 * @param	newController		The Controller object to register
	 */
	public function addController(newController:Controller):Void {
		
		trace("addController");
		trace("-- newController: "+newController);
		trace('=================');
		
		controllers.push(newController);
	}
	
	/**
	 * Loops through all registered Controllers and passes the infoObject to their
	 * update() methods. Excludes the controller broadcasting the update, to prevent
	 * recursion or multiple calls to the same method
	 * 
	 * @param	infoObject				Generic info object of data to pass to registered Controllers
	 * @param	callingController		The Controller calling the update function
	 */
	public function update(infoObject:Object,callingController:Controller):Void {
		
		trace("ControllerBridge update");
		trace("-- infoObject: "+infoObject);
		trace("-- callingController: "+callingController);
		trace(">>>>>>>>>>> bridgeName:"+bridgeName);
		trace('=================');
		
		/* Make info object null if none is supplied */
		if (infoObject === undefined) {
			infoObject = null;
		}
		/* Make calling controller null if none is supplied */
		if (callingController === undefined) {
			callingController = null;
		}
		
		/* Add bridge name to info object */
		infoObject.bridgeName		= bridgeName;
			
		/* Loop through registered controllers */
		for (var i:Number = 0; i < controllers.length; i++) {
			
			/* Pass infoObject to update() method of all controllers, exlcuding
			 * the controller which originally called update() */
			if (controllers[i] != callingController){
				controllers[i].update(infoObject);
			}
		}
	}
}