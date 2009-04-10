LoginController = ActiveController.create({
	/**
	 * Logins use the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	/**
	 * The main login page / processor
	 */
	index: function index()
	{
		var success 		= false;
		var error			= false;
		var	error_message 	= '';
		var username		= '';
		var ret_controller	= this.params.returnController || false;
		var ret_action		= this.params.returnAction || false;
		
		// a login has been submitted
		if (typeof(this.params.doLogin) != 'undefined' && this.params.doLogin == 1)
		{
			// validate the username
			var user = User.findByUsername(this.params.username);
			
			if(!user)
			{
				error			= true;
				error_message	= 'The username you entered was not found.';
			}			
			else
			{
				username = this.params.username;
				
				// now check the password
				user = User.findByPassword(Jaxer.Util.Crypto.MD5(this.params.password), { where: { username: username }});
				
				if(!user)
				{
					error			= true;
					error_message	= 'The password you entered was not valid.'
				}
				else
				{
					// drop the valid user id in the session
					Jaxer.session['user_id'] = user.id;
					
					if(this.params.ret_controller != 'false')
					{
						return_to_page(this.params.ret_controller, this.params.ret_action);
						return;
					}
					else
					{
						return_to_page('LoginController', 'success');
						return;
					}
				}
			}
		}
		
		// set the vars and render the template
		this.set('success', success);
		this.set('error', error);
		this.set('error_message', error_message);
		this.set('username', username);
		this.set('ret_controller', ret_controller);
		this.set('ret_action', ret_action);
		
		this.render({
			file: 'login/login.html'
		});
	},
	
	/**
	 * Displays the successful login page
	 */
	success: function success()
	{
		this.set('comment_moderation_count', get_comment_moderation_count());
		
		this.render({
			file: 'login/success.html'
		});
	},
	
	/**
	 * Logs a user out, and then displays the login page
	 */
	logout: function logout()
	{
		// unset the session var
		Jaxer.session['user_id'] = false;
		delete(Jaxer.session['user_id']);
		
		// call the index action, it will display the login page
		this.index();
	}
});