import flash.external.*;
import com.transfusionmedia.utils.*;
import com.transfusionmedia.mvc.*;
import com.transfusionmedia.Player.*;

/**
 * Controller class for the media player
 * 
 * @author  	    Warren Benedetto <warren@transfusionmedia.com>
 */
class com.transfusionmedia.Player.PlayerController extends AbstractController {
	
	/**
	 * Constructor
	 * 
	 * @param	model		The model the controller will communicate with
	 */
	public function PlayerController(model:Player) {
		
		super(model);
		Trace.header('PlayerController constructed');
	}	
	/**
	 * Updates model with new control layer state (in)
	 */
	public function showControlLayer():Void {
		
		Trace.message('Showing control layer');
		Player(this.getModel()).setControlLayerState('in');
	}
	/**
	 * Updates model with new control layer state (out)
	 */
	public function hideControlLayer():Void {
		
		Trace.message('Hiding control layer');
		Player(this.getModel()).setControlLayerState('out');
	}
	/**
	 * Toggles media state in model
	 */
	public function togglePlay():Void {
		Player(this.getModel()).toggleMediaState();
	}
	/**
	 * Toggles volume in model
	 */
	public function toggleMute():Void {
		Player(this.getModel()).toggleMute();
	}
	/**
	 * Toggles full screen mode in model
	 */
	public function toggleFullScreen():Void {
		Player(this.getModel()).toggleFullScreen();
	}
	/**
	 * Toggles model between elapsed and remaining time
	 */
	public function toggleTimer():Void {
		Player(this.getModel()).toggleTimer();
	}
	/**
	 * Jumps media to selected cue point
	 * 
	 * @param	xPos 	The x-position of the mouse click relative to the progress bar
	 */
	public function jumpToCuePoint(xPos:Number):Void {
		Player(this.getModel()).setCuePoint(xPos);
	}
	
	/**
	 * Displays embed interface via Javascript (in local context), or in the player
	 * (external context)
	 */
	public function showEmbedInterface():Void {
		
		var model:Player					= Player(this.getModel());
		var videoOptionsOverlay:MovieClip	= model.getVideoOptionsOverlay();
		
		
		/* If context is local, use javascript to display Embed interface */
		if (model.isLocal() == true) { 
			
			Trace.message('Context is local');
			System.security.allowDomain("*");
			System.security.allowInsecureDomain("*");
			ExternalInterface.call("atl.showEmbedWindow", "passed from showEmbedInterface()");
			
		} 
		/* If player is embedded, display Embed interface in widget */
		else {
			
			/* Pause video if it is playing */
			if (model.isPlaying() == true) {
				model.toggleMediaState();
			}
			
			/* Show interface */
			videoOptionsOverlay.content.gotoAndStop('embed');
			videoOptionsOverlay.content.copyButton.copyButtonText.text = 'Copy To Clipboard';
			videoOptionsOverlay.content.code.text = model.oembed.html;
			videoOptionsOverlay.gotoAndPlay('open');
		}
	}
	
	/**
	 * Displays share interface via Javascript (in local context), or in the player
	 * (external context)
	 */
	public function showShareInterface():Void {
		
		var model:Player					= Player(this.getModel());
		var videoOptionsOverlay:MovieClip	= model.getVideoOptionsOverlay();
		
		if (model.isLocal() == true) { 
			
			Trace.message('Context is local');
			System.security.allowDomain("*");
			System.security.allowInsecureDomain("*");
			ExternalInterface.call("atl.showShareWindow", "passed from showShareInterface()");
			
		} 
		/* If player is embedded, display Share interface in widget */
		else {
			
			/* Pause video if it is playing */
			if (model.isPlaying() == true) {
				model.toggleMediaState();
			}
			
			/* Show interface */
			videoOptionsOverlay.content.gotoAndStop('share');
			videoOptionsOverlay.content.copyButton.copyButtonText.text = 'Copy To Clipboard';
			videoOptionsOverlay.content.code.text = _root.movie;
			videoOptionsOverlay.gotoAndPlay('open');
		}
	}
}