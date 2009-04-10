/**
 * JsImagick Library
 * 
 * @namespace JsImagick
 */
var JsImagick = {
	
	/**
	 * Location of avatar images
	 * 
	 * @property
	 */
	avatarDirectory:	'',
	/**
	 * Location of source video images
	 * 
	 * @property
	 */
	sourceDirectory:	'',
	/**
	 * Location of thumb video images
	 * 
	 * @param
	 */
	thumbDirectory:		'',
	/**
	 * Location of convert on the filesystem
	 * 
	 * @param
	 */
	convertPath:		'',
	
	/**
	 * Sets up the class for use
	 * 
	 * @alias JsImagick.init
	 * @alias init
	 */
	init: function init()
	{
		this.avatarDirectory	= Application.Config.root + 'images_avatars/';
		this.sourceDirectory	= Application.Config.root + 'images_videos_original/';
		this.thumbDirectory		= Application.Config.root + 'images_videos_thumbs/';
		this.convertPath 		= '/usr/local/bin/convert';
	},
	
	/**
	 * Performs an adaptive resize of an image.
	 * 
	 * This means that the image will be sized to fit the provided dimensions as close as it can, then 
	 * cropped from the center to match
	 * 
	 * @param {String} source The source image (full path)
	 * @param {String} size The target dimensions (i.e. 100x100)
	 * @param {String} destination The path and filename to save the resulting image to
	 * @alias JsImagick.adaptiveResize
	 * @alias adaptiveResize
	 */
	adaptiveResize: function adaptiveResize(source, size, destination)
	{
		// build the shell command
		var command = <>{this.convertPath} {source} -thumbnail {size}^ -gravity center -extent {size} {destination}</>;
		
		// run the command
		this.runShell(command);
	},
	
	/**
	 * Runs a command on the command-line
	 * 
	 * @param {Array} command
	 * @alias JsImagick.runShell
	 * @alias runShell
	 */
	runShell: function runShell(command)
	{
		return Jaxer.Process.exec.apply(null, command.split(' '));
	}
}
;