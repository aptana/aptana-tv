(function(){

/*
 * CONFIGURATION INSTRUCTIONS
 *
 * The first thing you'll need to do is change the name of the SAMPLE_JAXER_ROUTER.
 * This will need to be done at the top and bottom of the file.
 *
 * Second, you'll need to change the "name" variable to something unique as well.
 *
 * Third, you'll need to change things to reflect the installation.  If this is installed at 
 * the root of a site (default), such as http://example.com, you'll need only update the configPath
 * to match the site's document root.
 *
 * If thi app is installed in a directory of a site, such as http://example.com/aptana.tv, you'll need 
 * to uncomment the appropriate lines, and change the values of "webRoot" and "urlPrefix" (which exists
 * in two places) to match.  The url prefix should not contain any slashes, but the web root needs a leading
 * and trailing slash.  Using the above example, those would be "aptana.tv" and "/aptana.tv/" respectively.
 *
 */

var SAMPLE_JAXER_ROUTER = {
 
    urlTest: function(parsedUrl)
    {
		// uncomment the following lines if you've got more than one activejs site running on this server
		// this is necessary to make sure this particular router doesn't catch requests for wrong domains
		// i.e. http://sample.com is what this router is for, but it will also match http://example.com if
		// example.com is hosted on this server as well.
		//
		// You will also need to adjust the value in the if statement to reflect the appropriate host name as well
		
		// if(Jaxer.request.env.HTTP_HOST != 'www.yourdomain.com')
		// {
		//      return false;
		// }
		
		var envIndex = (!Jaxer.request.env.REDIRECT_URL) ? 'SCRIPT_NAME' : 'REDIRECT_URL';

		// Comment the following line if not installed in a site root
		return (Jaxer.request.env.SCRIPT_NAME.indexOf('/jaxer-route') > -1);

		// Uncomment the following two lines and modify appropriately if not installed in a site root
		// var urlPrefix = 'aptana.tv';
		// return ((Jaxer.request.env[envIndex].indexOf(urlPrefix) > -1) && (Jaxer.request.env.SCRIPT_NAME.indexOf('/jaxer-route')>-1));
    },
    handler: function(resolvedName, parsedUrl)
    {
        return Jaxer.request.app.configPath + '/app/boot.js';
    },

    name: 'sampleJaxerRouter',
	// no trailing slash
	configPath: '/var/www/html',
	urlPrefix: '',
	// needs a leading and trailing slash (if not in a site root)
	webRoot: '/'
};
 
Config.apps.unshift(SAMPLE_JAXER_ROUTER);
 
})();

