ProfileController = ActiveController.create({
	/**
	 * Profiles are modified inside a modal window
	 */
	layout: {
		file: 'layouts/layout_modal.html'
	},
	
	/**
	 * The default profile action
	 * 
	 *  - Processes updates
	 *  - Shows the current profile info
	 */
	index: function index() 
	{
		// load the user from the session
		var user 	= User.findById(Jaxer.session['user_id']);
		var updated	= false;
		
		if(typeof(this.params.doUpdate) != 'undefined' && this.params.doUpdate == 1)
		{
			// update the profile from the post
			user.set('first_name', (this.params.first_name == '') ? user.get('first_name') : this.params.first_name);		
			user.set('last_name', (this.params.last_name == '') ? user.get('last_name') : this.params.last_name);		
			user.set('email', (this.params.email == '') ? user.get('email') : this.params.email);
			user.set('website', (this.params.website == '') ? user.get('website') : this.params.website);
			user.set('introduction', (this.params.introduction == '') ? user.get('introduction') : this.params.introduction);
			
			// update the profile image (if submitted)
			Jaxer.request.files.forEach(function (file)
			{
				// we've got a new image
				if(file.elementName == 'avatar_file' && file.originalFileName != '')
				{
					// init the imagick lib
					JsImagick.init();
					
					// generate filenames
					var filename 		= generate_file_name(file.fileName);
					var original_file 	= JsImagick.avatarDirectory + filename;
					var small_file 		= JsImagick.avatarDirectory + 'thumb_small_' + filename;
					
					// save the original file
					file.save(original_file);
					
					// generate a thumbnail
					JsImagick.adaptiveResize(original_file, '80x80', small_file);
					
					// update the user with the new filename
					user.set('avatar_file', filename);
				}
			});
			
			// save the user
			user.save();
			
			updated = true;
		}
		
		// set the vars and render
		this.set('updated', updated);
		this.set('user', user);
		
		this.render({
			file: 'profile/profile.html'
		});
	}
});