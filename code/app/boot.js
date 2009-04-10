(function boot(scope){
    var applicationPath = Jaxer.request.app.configPath + '/app';
    
    Application = {};
    
    function load_all_js_files_in_directory(directory)
    {
        var file_to_load = [];
        Jaxer.Dir.grep(applicationPath + '/' + directory,{
            pattern: '^.*\.?js$',
            recursive: true
        }).forEach(function directory_iterator(file){
            file_to_load.push(file.path);
        });
        file_to_load.sort();
        for (var i=0; i < file_to_load.length; i++)
        {
            Jaxer.load('file://' + file_to_load[i],scope,'server');
        }
    };
    
    //load lib and config
    load_all_js_files_in_directory('lib');
    Jaxer.load('file://' + applicationPath + '/config.js',scope,'server');
    
    //setup db
    ActiveRecord.connect();
  
    //put space before initial request in log
    ActiveSupport.log('');
  
    //setup dispatcher
    Application.routes = new ActiveRoutes(Application.Config.routes,scope,{
        classSuffix: 'Controller',
        dispatcher: function dispatcher(route){
            var controller = new this.scope[route.params.object]();
            controller.params = {};
            ActiveSupport.extend(controller.params,ActiveController.Server.parseParams(Jaxer.request.data || {})); //post
            ActiveSupport.extend(controller.params,ActiveController.Server.parseParams(Jaxer.request.parsedUrl.queryParts)); //get
            ActiveSupport.extend(controller.params,route.params);
            //handles request method (GET,PUT,etc) not method name
            if(controller.params._method)
            {
                delete controller.params._method;
            }
            
            if(ActiveController.logging)
            {
              ActiveSupport.log(''); //put space before each request
              ActiveSupport.log('ActiveController: ' + route.params.object + '#' + route.params.method + ' [' + ActiveController.Server.Request.getMethod().toUpperCase() + ' ' + ActiveController.Server.Request.getURI() + '] <params:' + uneval(controller.params) + '>');
            }
            controller[route.params.method]();
        },
        base: Application.Config.web_root.replace(/\/$/,'')
    });
    
    //load models and controllers
    load_all_js_files_in_directory('models');
    load_all_js_files_in_directory('controllers');
    
    //dispatch the request
	var web_root = (Application.Config.web_root == '/') ? '' : Application.Config.web_root;
    Application.routes.dispatch(Jaxer.request.uri.substring(Jaxer.request.uri.indexOf('/' + web_root) + (web_root.length + 1)));
})(this);
