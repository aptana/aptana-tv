import com.transfusionmedia.utils.*;
import com.transfusionmedia.mvc.*;
import com.transfusionmedia.Player.*;

/**
 * Model for media player
 * 
 * @author Warren Benedetto <warren@transfusionmedia.com>
 */
class com.transfusionmedia.Player.Player extends Observable {
	
	private var context:Object;
	private var ui:Object;
	private var media:Object;
	private var internals:Object;
	private var playlist:Object;
	public var video:Object;
	private var audio:Object;
	public var view:PlayerView;
	public var oembed:Object;
	public var titleVisible:Boolean;
	
	public function Player() {
		
		Trace.header('Player model constructed');
		
		/* Create new instance of view and register it to receive updates from model */
		this.view								= new PlayerView(this, undefined);
		this.addObserver(this.view);

		this.internals							= new Object();
		this.media								= new Object();
		this.context							= new Object();
		
		this.ui									= new Object();
		this.ui.controlLayer					= new Object();
		this.ui.playerControlBar				= new Object();
		this.ui.videoOptions					= new Object();
		this.ui.playhead						= new Object();
		this.ui.volumeSlider					= new Object();
		this.ui.playButton						= new Object();
		this.ui.progressBar						= new Object();
		this.ui.screen							= new Object();
		this.ui.timer							= new Object();
		this.ui.logo							= new Object();
		this.ui.placeholder						= new Object();
		this.ui.titleHolder						= new Object();
		this.ui.preloader						= new Object();
		this.ui.videoOptionsOverlay				= new Object();

		this.ui.playButton.state				= 'play';		// play or pause
		this.ui.progressBar.width				= 0;			// in pixels
		this.ui.screen.isFullScreen				= false;
		this.ui.timer.state						= 'elapsed'; 	// elapsed or remaining
		this.ui.logo.clickURL					= '';
		this.ui.controlLayer.isSliding			= false;
		this.ui.controlLayer.state				= 'in';			// in or out
		
		this.media.volume						= 100; 			// 0 to 100
		this.media.duration						= 0; 			// in seconds
		this.media.offset						= 0; 			// in seconds
		this.media.buffer						= 7; 			// in seconds
		this.media.url							= '';
		this.media.state						= 'stop';  		// play, pause, stop
		
		this.video								= null;
		this.audio								= null;
		this.context.isLocal 					= true;
		this.titleVisible						= true;
		
		this.oembed								= new Object();
		this.oembed.type						= '';
		this.oembed.version						= 0;
		this.oembed.providerName				= '';
		this.oembed.providerURL					= '';
		this.oembed.title						= '';
		this.oembed.authorName					= '';
		this.oembed.authorImageURL				= '';
		this.oembed.html						= '';
		this.oembed.width						= 0;
		this.oembed.height						= 0;
		this.oembed.thumbnailURL				= 0;
		this.oembed.videoID						= 0;
		this.oembed.videoName					= 0;	
	}
	
	/**
	 * Initializes Player internals
	 * 
	 * - Sets up new NetStream and NetConnection
	 * - Attaches audio and video to movieclips
	 * - Creates new Sound object for audio
	 * - Sets event handling for NetStream events
	 */
	public function init(video:MovieClip, audio:MovieClip):Void {
		
		Trace.header('Initializing Player');

		/* If player is embedded, show preloader and get XML */
		if (this.isLocal() == false) {
			this.ui.preloader._alpha			= 100;
			this.getXML(_root.XML_BASE_URL + '/api/oembed.xml?url=' + _root.movie);
		}

		/* Check if player has already been associated with a Video object */
		if (video == undefined && this.video == null) {
			throw new Error('Must set Player.video to the location of the Video object on the stage.');
		} else if (video != undefined){
			this.video							= video;
		}
		/* If no audio movieclip has been specified, create an empty movieclip to which audio will be attached */
		if (audio == undefined && this.audio == null) {
			this.audio						= _root.createEmptyMovieClip('audio', _root.getNextHighestDepth());
		} else if (audio != undefined) {
			this.audio							= audio;
		}
		
		/* Create new NetConnection */
		this.internals.netConnection			= new NetConnection();
		this.internals.netConnection.connect(null);
		
		/* Create new NetStream and attach it to Video object */
		this.internals.netStream				= new NetStream(this.internals.netConnection);
		this.video.attachVideo(this.internals.netStream);
		this.internals.netStream.setBufferTime(this.media.buffer);
		
		/* Turn on video smoothing */
		this.video.smoothing					= true;
		
		/* Attach NetStream to audio movieclip */
		this.audio.attachAudio(this.internals.netStream);
		
		/* Create new Sound object and set default volume */
		this.internals.sound					= new Sound(this.audio);
		this.internals.sound.setVolume(this.media.volume);
		
		var owner								= this;
		
		/* Set media duration once metadata is available */
		this.internals.netStream.onMetaData 	= function(infoObject:Object):Void {
			
			Trace.header("NetStream.onMetaData called: (" + getTimer() + " ms)");
			Trace.list(infoObject);

			owner.media.duration				= infoObject['duration'];
			owner.video.width					= infoObject['width'];
			owner.video.height					= infoObject['height'];
			owner.setChanged();
			
			var infoObj:Object					= new Object();
			infoObj.width						= infoObject['width'];
			infoObj.height						= infoObject['height'];
			infoObj.resizeVideo					= true;
			owner.notify(infoObj);
		}
		
		/* Track player status */
		this.internals.netStream.onStatus 		= function(infoObject:Object):Void {
			
			Trace.header("NetStream.onStatus called: (" + getTimer() + " ms)");
			Trace.list(infoObject);
			
			/* If media is playing, set state to 'play' */
			if (infoObject['code'] == "NetStream.Play.Start") {
				owner.setMediaState('play');
				owner.ui.placeholder._visible		= false;
				owner.ui.preloader._visible			= false;
			}
			/* When media ends, set state to 'stop' */
			else if (infoObject['code'] == "NetStream.Play.Stop") {
				owner.setMediaState('stop');
			} 
			
			// TODO: Add buffering message when buffering
			// TODO: Add error message when there's a video error
		}

		if (this.isLocal()){
			this.view.init();
		}
	}
	
	/**
	 * Fetches XML feed and stores it in an object
	 *          
	 * @param   sourceURL 		The URL of the xml feed to fetch
	 * @return  Void
	 */
	private function getXML(xmlURL:String):Void {
	
		Trace.header('Getting XML');
		Trace.message('XML url: '+xmlURL);
	
		/* Load content from url into XML object named theXML */
		var theXML:XML 						= new XML();
		theXML.ignoreWhite 					= true;
		theXML.load(xmlURL);
		
		var owner							= this;
		
		/* Run function once XML is loaded successfully */
		theXML.onLoad = function(success) {
			
			if (success){
				Trace.header('XML Loaded');
				trace(theXML);
				
				/* Convert XML to object and pass to processing method */
				var xmlObject:Object			= XMLUtils.xmlToObject(theXML);
				owner.processXML(xmlObject);
			} 
			/* If the XML couldn't be loaded, try loading the default xml file */
			else if (xmlURL != 'oembed.xml') {
				owner.getXML('oembed.xml');
			}
		}
		theXML.onHTTPStatus = function(httpStatus:Number) {

			if(httpStatus < 100) {
				Trace.message('Flash error');
			}
			else if(httpStatus < 200) {
				Trace.message('Information');
			}
			else if(httpStatus < 300) {
				Trace.message('Success');
			}
			else if(httpStatus < 400) {
				Trace.message('Redirect');
			}
			else if(httpStatus < 500) {
				Trace.message('Client error');
			}
			else if(httpStatus < 600) {
				Trace.message('Server error');
			}
		}
	}
	
	/**
	 * Add XML data to Widget model properties
	 * 
	 * @param	xmlObject		The object created from the widget xml
	 */
	private function processXML(xmlObject:Object):Void {
		
		Trace.header('Processing XML'); 
		
		this.oembed.type						= String(xmlObject.oembed.type);
		this.oembed.version						= Number(xmlObject.oembed.version);
		this.oembed.providerName				= String(xmlObject.oembed.provider_name);
		this.oembed.providerURL					= String(xmlObject.oembed.provider_url);
		this.oembed.title						= String(xmlObject.oembed.title);
		this.oembed.authorName					= String(xmlObject.oembed.author_name);
		this.oembed.authorImageURL				= String(xmlObject.oembed.author_image_url);
		this.oembed.html						= String(xmlObject.oembed.html);
		this.oembed.width						= Number(xmlObject.oembed.width);
		this.oembed.height						= Number(xmlObject.oembed.height);
		this.oembed.thumbnailURL				= String(xmlObject.oembed.thumbnail_url);
		this.oembed.videoID						= Number(xmlObject.oembed.video_id);
		this.oembed.videoName					= String(xmlObject.oembed.video_name);

		this.setMediaURL(_root.VIDEO_BASE_URL + this.oembed.videoName);
		this.setPlaceholderURL(this.oembed.thumbnailURL);
		this.setLogoClickURL(this.oembed.providerURL);

		this.view.init();
	}

	/**
	 * Plays the media
	 */
	public function play():Void {
		
		Trace.message('Playing media');
		Trace.message('Current media state is ' + this.media.state);
		
		if (this.media.state == 'pause') {
			this.internals.netStream.seek(this.media.offset);
			this.internals.netStream.pause();
		} else {
			this.internals.netStream.play(this.media.url, this.media.offset);
		}
		this.setMediaState('play');
	}
	
	/**
	 * Restarts media from beginning
	 */
	public function restart():Void {
		
		Trace.message('Restarting media');
		
		this.internals.netStream.seek(0);
		this.media.offset = 0;
		this.setMediaState('play');
	}
	
	/**
	 * Stops media from playing (if it isn't already stopped)
	 */
	public function stop():Void {
		
		Trace.message('Stopping media');
		
		if (this.media.state != 'stop') {
			this.internals.netStream.close();
			this.media.offset = 0;
			this.setMediaState('stop');
		}
	}
	
	/**
	 * Pauses media
	 */
	public function pause():Void {
		
		Trace.message('Pausing media');
		
		/* If the media is playing, pause it */
		if (this.media.state == 'play') {

			/* Store current play position as offset so we can pick up where
			 * we left off if the user plays the media again */
			this.media.offset 	= this.internals.netStream.time;
			this.internals.netStream.pause();
		}
		this.setMediaState('pause');
		
	}
	
	/**
	 * Takes time in seconds and formats it as MM:SS
	 * 
	 * @param	seconds		The seconds to convert
	 * @return  Time in MM:SS format
	 */
	private function formatTimer(seconds:Number):String {
		
		/* If seconds isn't a number, return 00:00 */
		if (isNaN(seconds)) {
			return "00:00";
		} 
		
		/* Convert seconds to minutes and seconds */
		var minutes					= Math.floor(seconds / 60);
		var seconds					= Math.floor(seconds % 60);
		
		if (minutes < 0) {
			minutes					= 0;
		}
		if (seconds < 0) {
			seconds					= 0;
		}
		var minString				= String(minutes);
		var secString				= String(seconds);
		
		/* Add leading zero to single-digit minutes */
		if (minutes < 10) {
			minString				= "0" + minString;
		}
		
		/* Add leading zero to single-digit seconds */
		if (seconds < 10) {
			secString				= "0" + secString;
		}
		/* Return timer in MM:SS format */
		return minString + ":" + secString;
	}

	/**
	 * Gets MM:SS timecode for current position of media (elapsed time)
	 * 
	 * @return Timer, in MM:SS format
	 */
	private function getCurrentTimer():String {
		
		/* Get current timer, in seconds */
		var currentSeconds:Number		= this.internals.netStream.time;
		return this.formatTimer(currentSeconds);
	}
	
	/**
	 * Gets MM:SS timecode for remaining time left in media
	 * 
	 * @return Timer, in MM:SS format
	 */
	private function getRemainingTimer():String {
		var remainingSeconds:Number		= this.media.duration - this.internals.netStream.time;
		return this.formatTimer(remainingSeconds);
	}
	
	/**
	 * Gets the total duration of the media, in MM:SS format
	 * 
	 * @return Total duration of media, in MM:SS format
	 */
	private function getTotalTimer():String {
		return this.formatTimer(this.media.duration);	
	}
	
	/**
	 * Gets timer based on timer state, either elapsed or remaining time
	 * 
	 * @return Timer in MM:SS format
	 */
	public function getTimer():String {
		
		if (this.ui.timer.state == 'elapsed') {
			return this.getCurrentTimer();
		} else {
			return this.getRemainingTimer();
		}
	}
	
	/**
	 * @param 	round 		True to round the returned percentage
	 * @return	The percentage of the media that has been loaded
	 */
	public function getPercentLoaded(round:Boolean):Number {
		if (!isNaN(this.internals.netStream.bytesTotal) && this.internals.netStream.bytesTotal > 0) {
			
			var percent:Number 	= Math.round((this.internals.netStream.bytesLoaded / this.internals.netStream.bytesTotal) * 100);
			
			if (round == true) {
				percent			= Math.round(percent);
			}
			return percent;
		} else {
			return 0;
		}
	}
	/**
	 * @param 	round 		True to round the returned percentage
	 * @return The percentage of the media that has already played
	 */
	public function getPercentCompleted(round:Boolean):Number {
		
		if (!isNaN(this.media.duration) && this.media.duration > 0) {
			
			var percent:Number = (this.internals.netStream.time / this.media.duration) * 100;
			
			if (round == true) {
				percent			= Math.round(percent);
			}
			return percent;
		} else {
			return 0;
		}
	}
	/**
	 * @return The current media state
	 */
	public function getMediaState():String {
		return this.media.state;
	}
	/**
	 * @return The state of the control layer (in or out)
	 */
	public function getControlLayerState():String {
		return this.ui.controlLayer.state;
	}	
	/**
	 * @return The player controls movieclip
	 */
	public function getPlayerControlBar():MovieClip {
		return this.ui.playerControlBar;
	}
	/**
	 * @return The video options movieclip
	 */
	public function getVideoOptions() {
		return this.ui.videoOptions;
	}
	/**
	 * @return The width of the progress bar
	 */
	public function getProgressBarWidth() {
		return this.ui.progressBar.width;
	}
	/**
	 * @return The clickthrough url for the logo
	 */
	public function getLogoClickURL():String {
		return this.ui.logo.clickURL;
	}
	/**
	 * @return The placeholder image movieclip
	 */
	public function getPlaceholder():MovieClip {
		return this.ui.placeholder;
	}
	/**
	 * @return The title holder movieclip
	 */
	public function getTitleHolder():MovieClip {
		return this.ui.titleHolder;
	}
	/**
	 * @return The preloader movieclip
	 */
	public function getPreloader():MovieClip {
		return this.ui.preloader;
	}
	/**
	 * @return The video options overlay movieclip
	 */
	public function getVideoOptionsOverlay():MovieClip {
		return this.ui.videoOptionsOverlay;
	}
	
	/**
	 * @return True if media is playing
	 */
	public function isPlaying():Boolean {
		return this.media.state == 'play';
	}
	/**
	 * @return True if the media is stopped
	 */
	public function isStopped():Boolean {
		return this.media.state == 'stop'
	}
	/**
	 * @return True if playhead is currently dragging
	 */
	public function isPlayheadDragging():Boolean {
		return this.ui.playhead.isDragging;
	}
	/**
	 * @return True is volume slider is currently dragging
	 */
	public function isVolumeSliderDragging():Boolean {
		return this.ui.volumeSlider.isDragging;
	}
	/**
	 * @return True if control layer is currently in motion
	 */
	public function isControlLayerSliding():Boolean {
		return this.ui.controlLayer.isSliding;
	}
	/**
	 * @return True if player is embedded on the local site
	 */
	public function isLocal():Boolean {
		return this.context.isLocal;
	}
	
	/**
	 * Selects a specific point in the media, and plays from there. Called when 
	 * the user clicks the progress bar. 
	 * 
	 * @param	xPos		The X position on the progress bar where the user clicked
	 */
	public function setCuePoint(xPos:Number):Void {
		
		Trace.message('Setting cue point based on xPos of ' + xPos);
		
		if (xPos < 0) {
			xPos = 0;
		}
		
		/* Determine how far to increment the playhead each second */
		var increment:Number		= this.ui.progressBar.width / this.media.duration;
		
		/* Calulate the offset by converting x position to seconds */
		this.media.offset			= Math.floor(xPos / increment);

		/* Jump media to selected offset */
		this.internals.netStream.seek(this.media.offset);
	}
	
	/**
	 * Sets the volume
	 * 
	 * @param	volume		0 to 100
	 */
	public function setVolume(volume:Number):Void {
		
		Trace.message('Setting volume to ' + volume);
		this.internals.sound.setVolume(volume);
		this.media.volume 						= volume;
		
		setChanged();
		
		var infoObj:Object						= new Object();
		infoObj.newVolume						= this.media.volume;
		notify(infoObj);
	}
	
	/**
	 * Sets the state of the player: play, pause, or stop
	 * 
	 * @param	state Either play, pause, or stop
	 */
	private function setMediaState(state:String):Void {
		
		Trace.message('Setting media state to ' + state);
		
		switch (state){
			case 'play':
				this.media.state				= 'play';
				this.ui.playButton.state		= 'play';
				break;
			case 'stop':
				this.media.state				= 'stop';
				this.ui.playButton.state		= 'play';
				break;
			case 'pause':
				this.media.state				= 'pause';
				this.ui.playButton.state		= 'pause';
				break;
			default:
				throw new Error('Illegal state type passed to Player.setMediaState(). Acceptable states: play, stop, pause');
		}
		setChanged();
		
		var infoObj:Object						= new Object();
		infoObj.newMediaState					= this.media.state;
		notify(infoObj);
	}
	/**
	 * Sets the url of the media to play
	 * 
	 * @param	url		The url of the media to play
	 */
	public function setMediaURL(url:String):Void {
		Trace.message('Setting Player media url to ' + url);
		this.media.url 						= url;
	}
	/**
	 * Sets the clickthrough url for the player controls logo
	 * 
	 * @param	url		The clickthrough url
	 */
	public function setLogoClickURL(url:String):Void {
		Trace.message('Setting logo click url to ' + url);
		this.ui.logo.clickURL 				= url;
	}
	/**
	 * Sets the width of the progress bar. Needed when setting cue point.
	 * 
	 * @param	width	The width of the progress bar, in pixels
	 */
	public function setProgressBarWidth(width:Number):Void {
		Trace.message('Setting progress bar width to ' + width);
		this.ui.progressBar.width			= width;
	}
	
	/**
	 * Flags whether control layer is currently in motion
	 * 
	 * @param	isSliding
	 */
	public function setControlLayerSliding(isSliding:Boolean) {	
		Trace.message('Setting control layer sliding to ' + isSliding);
		this.ui.controlLayer.isSliding		= isSliding;		
	}
	
	/**
	 * Sets the control layer state to in or out, if it's not already in motion 
	 * 
	 * @param	state	The new control layer state (in or out)
	 */
	public function setControlLayerState(state:String):Void {
		
		/* Check if control layer is already sliding */
		if (this.ui.controlLayer.isSliding != true) {
			
			Trace.message('Setting control layer state to ' + state);
			
			this.ui.controlLayer.state		= state;
			this.ui.controlLayer.isSliding	= true;
			
			setChanged();
			notify();
		}
	}
	
	/**
	 * Stores reference to player controls movieclip
	 * 
	 * @param	playerControlBar		The player controls movieclip
	 */
	public function setPlayerControlBar(playerControlBar:MovieClip):Void {
		Trace.message('Setting player controls to '+playerControlBar);
		this.ui.playerControlBar			= playerControlBar;
	}
	
	/**
	 * Stores reference to video options movieclip (share, embed, etc)
	 * 
	 * @param	videoOptions	The video options movieclip
	 */
	public function setVideoOptions(videoOptions:MovieClip):Void {
		Trace.message('Setting video options to '+videoOptions);
		this.ui.videoOptions				= videoOptions;
	}
	
	/**
	 * Stores reference to placeholder image movieclip
	 * 
	 * @param	placeholder		The placeholder image movieclip
	 */
	public function setPlaceholder(placeholder:MovieClip):Void {
		Trace.message('Setting placeholder to '+placeholder);
		this.ui.placeholder					= placeholder;
	}
	
	/**
	 * Stores reference to title holder movieclip
	 * 
	 * @param	titleHolder		The title holder movieclip
	 */
	public function setTitleHolder(titleHolder:MovieClip):Void {
		Trace.message('Setting title holder to '+titleHolder);
		this.ui.titleHolder					= titleHolder;
	}
	
	/**
	 * Stores reference to preloader movieclip
	 * 
	 * @param	preloader		The preloader movieclip
	 */
	public function setPreloader(preloader:MovieClip):Void {
		Trace.message('Setting preloader to '+preloader);
		this.ui.preloader					= preloader;
	}
	
	/**
	 * Stores reference to video options overlay movieclip
	 * 
	 * @param	videoOptionsOverlay		The video options overlay  movieclip
	 */
	public function setVideoOptionsOverlay(videoOptionsOverlay:MovieClip):Void {
		Trace.message('Setting video options overlay to '+videoOptionsOverlay);
		this.ui.videoOptionsOverlay			= videoOptionsOverlay;
	}
	
	/**
	 * Sets url to placeholder image
	 * 
	 * @param	url				The placeholder image url
	 */
	public function setPlaceholderURL(url:String):Void {
		Trace.message('Setting placeholder url to ' + url);
		this.ui.placeholder.url				= url;
	}
	
	/**
	 * Sets the context where the player is embedded (local or external)
	 * 
	 * @param	context		The context where the player is embedded (local or external)
	 */
	public function setContext(context:String):Void {
		if (context == 'local') {
			this.context.isLocal 			= true;
		} else {
			this.context.isLocal 		 	= false;
		}
	}
	
	/**
	 * Toggles media state between play and pause
	 */
	public function toggleMediaState():Void {
		
		Trace.message('Toggle media state. Current media state is ' + this.media.state);
		
		if (this.media.state == 'play') {
			this.pause();
		} else {
			this.play();
		}
	}
	
	/**
	 * Toggles volume between 0 and 100
	 */
	public function toggleMute():Void {
		
		Trace.message('Toggle mute. Current volume is ' + this.media.volume);
		
		if (this.media.volume == 0) {
			this.setVolume(100);
		} else {
			this.setVolume(0);
		}
	}
	
	/**
	 * Toggles full screen mode
	 */
	public function toggleFullScreen():Void {
		
		Trace.message('Toggle full screen. Stage display state is '+Stage.displayState);
		
		if (Stage.displayState == 'fullScreen') {
			this.ui.screen.isFullScreen			= false;
		} else {
			this.ui.screen.isFullScreen			= true;
		}
		setChanged();
		
		var infoObj:Object						= new Object();
		infoObj.isFullScreen					= this.ui.screen.isFullScreen;
		notify(infoObj);
	}
	
	public function toggleTimer():Void {
		
		Trace.message('Toggle timer. Current state is ' + this.ui.timer.state);
		
		if (this.ui.timer.state == 'elapsed') {
			this.ui.timer.state					= 'remaining';
		} else {
			this.ui.timer.state					= 'elapsed';
		}
	}
}