CommentsController = ActiveController.create({
	/**
	 * Comments use the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	/**
	 * Processes a new comment
	 * 
	 * New comments are filtered through a couple of checks before they are posted.
	 * 
	 * The process goes like this:
	 *  - Check to see if the user is logged in. If they are, load their information and store it with the comment
	 *  - If not logged in, check to see if the commenter's email matches a user in the system.  If it does, 
	 *    override their submitted information with that of their profile
	 *  - Check the user's IP address and email against the blacklist.  If they're blacklisted, tell them, then return
	 *  - Check to see if the user's email is whitelisted.  If they are, their new comment does not need to 
	 *    be moderated.  To be whitelisted, a user needs only have one previous comment approved
	 *  - Add the comment
	 *  - If the comment is awaiting moderation, add its new ID to the session, so we can tell the user that their
	 *    comment has not been approved yet.
	 */
	comment: function comment()
	{
		// init all the vars we can without any logic
		var user_id 	= 0;
		var user 		= false;
		var ip 			= Jaxer.request.remoteAddr;
		
		// check the session
		user = (is_logged_in()) ? User.findById(Jaxer.session['user_id']) : false;
		// if no session, check the email
		user = (!user) ? User.findByEmail(this.params.email) : user;
		
		// if we found a user, override / set any necessary info
		if(user)
		{
			this.params.email 	= user.email;
			this.params.website = user.website;
			this.params.name 	= user.first_name;
			user_id				= user.id;
		}

		// make sure this user / IP is not black-listed
		var result = Jaxer.DB.execute('SELECT COUNT(*) FROM comment_blacklists WHERE (ip=? OR email=?) AND is_active=1', ip, this.params.email);
		
		// they're blacklisted, show them the message, and stop
		if(result.singleResult != 0)
		{
			this.render({
				file: 'comments/comment_blacklisted.html'
			});
			
			return;
		}
		
		// see if this is whitelisted
		var result = Jaxer.DB.execute('SELECT COUNT(*) FROM comment_whitelists WHERE email=?', this.params.email);
		// a user is always approved if they've got an ID (they're a member)
		var approved = (result.singleResult != 0 || user_id != 0) ? true : false;
		
		// create the new comment
		var newComment = Comment.create({
			video_id: 	this.params.video_id,
			user_id: 	user_id,
			name: 		this.params.name,
			email: 		this.params.email,
			website: 	this.params.website,
			ip: 		ip,
			body: 		strip_tags(this.params.comment, '<b><i><strong><em>'),
			approved: 	approved
		});
		
		// if they weren't approved (awaiting moderation), update the session
		if(!approved)
		{
			// create the session var if it doesn't exist
			if(typeof(Jaxer.session['waiting_comments']) == 'undefined')
			{
				Jaxer.session['waiting_comments'] = '';
			}
			
			// load the string from the session, convert it to an array
			var waiting_comments = Jaxer.session['waiting_comments'].split(',');
			// add the comment id
			waiting_comments.push(newComment.id);
			// convert the array back to a string, and store it
			Jaxer.session['waiting_comments'] = waiting_comments.join(',');
		}
		
		// notifiy the author of the comment
		this.notifyAuthor(newComment);
		
		// set our template vars, and render the template
		this.set('video_id', this.params.video_id);
		this.render({
			file: 'comments/comment_redirect.html'
		});
	},
	
	/**
	 * Handles all moderation requests
	 * 
	 * The following moderations actions are valid:
	 *  - approve: Approves the comment, and adds the user's email to the whitelist (if not there)
	 *  - delete: Simply deletes the comment (sets is_active: false)
	 *  - blacklist: Blacklists the user by IP and email
	 *  - spam: Blacklists the user by email
	 */
	moderate: function moderate()
	{
		// force auth for this page
		if(require_login())
		{
			return;
		}
		
		// first, grab the related video (so we can redirect)
		var video_id = Jaxer.DB.execute('SELECT videos.id FROM videos JOIN comments ON videos.id=comments.video_id WHERE comments.id=?', this.params.id).singleResult;
		
		this.moderateComment(this.params.id, this.params.action);
		
		// set the tempalte var and render the template
		this.set('video_id', video_id);
		this.render({
			file: 'comments/comment_redirect.html'
		})
	},
	
	/**
	 * Shows the comments moderation queue.
	 */
	queue: function queue() 
	{
		// force auth for this page
		if(require_login('CommentsController', 'queue'))
		{
			return;
		}
		
		if(typeof(this.params.doModerate) != 'undefined' && this.params.doModerate == 1)
		{
			var that = this;
			
			// go through each of the lists, starting with approved
			if(typeof(this.params.approve) == 'object')
			{
				this.params.approve.forEach(function (comment) {
					that.moderateComment(comment, 'approve');
				});
			}
			// spam comments
			if(typeof(this.params.spam) == 'object')
			{
				this.params.spam.forEach(function (comment) {
					that.moderateComment(comment, 'spam');
				});
			}
			// delete comments
			if(typeof(this.params.remove) == 'object')
			{
				this.params.remove.forEach(function (comment) {
					that.moderateComment(comment, 'delete');
				});
			}
			// blacklist comments
			if(typeof(this.params.abuse) == 'object')
			{
				this.params.abuse.forEach(function (comment) {
					that.moderateComment(comment, 'blacklist');
				});
			}
		}
		
		var comment_sql = 'SELECT * FROM comments WHERE is_active=1 AND approved=0 ORDER BY created ASC';
		
		this.set('comments', Comment.find(comment_sql));
		
		this.render({
			file: 'comments/moderation_list.html'
		});
	}
}, {
	/**
	 * Notifies the author of a new comment
	 * 
	 * @param {Comment} comment
	 */
	notifyAuthor: function notifyAuthor(comment)
	{
		var port 	= Jaxer.SMTP.DEFAULT_PORT;
		var message = new Jaxer.SMTP.MailMessage();
		var from	= 'Aptana TV <no-reply@aptana.tv>';
		var video	= Video.findById(comment.video_id);
		var user 	= ActiveRecord.execute('SELECT users.email FROM users JOIN videos ON videos.user_id=users.id WHERE videos.id=' + comment.video_id).singleResult;
		var	to		= user;
		var subject = (comment.approved) ? '[Aptana TV] New Comment: "' + video.name + '"' : '[Aptana TV] Please Moderate: "' + video.name + '"';
		var waiting_count = get_comment_moderation_count();
		
		// don't send it to the user that just commented on their own video
		if(to == comment.email)
		{
			return;
		}
		
		var host = 'http://' + Jaxer.request.env.HTTP_HOST;

		var body = 'A new comment on the video, "' + video.name + '"';
		body += (comment.approved) ? ' has been made\n' : ' is waiting for your approval\n';
		body += host + videoUrl({ slug: video.slug }) + '\n\n';
		body += 'Author: ' + comment.name + '\n';
		body += 'Email: ' + comment.email + '\n';
		body += 'URL: ' + comment.website + '\n';
		body += 'Comment:\n' + comment.body
		
		body += '\n\nApprove it: ' + host + commentModerateUrl({ id: comment.id, action: 'approve' }) + '\n';
		body += 'Spam it: ' + host + commentModerateUrl({ id: comment.id, action: 'spam' }) + '\n';
		body += 'Delete it: ' + host + commentModerateUrl({ id: comment.id, action: 'delete' }) + '\n';
		
		if(waiting_count > 0) 
		{
			body += '\n\nThere are currently ' + waiting_count + ' comments in the moderation queue.  You can view them here:\n';
			body += host + commentModerationUrl();
		}
		
		message.setFrom(from);
		message.addRecipient(to);
		message.setSubject(subject);
		message.setBody(body);
		
		if(to.indexOf('paul@aptana.com') == -1)
		{
			message.addRecipient('paul@aptana.com');
		}
		
		if(to.indexOf('ian@aptana.com') == -1)
		{
			message.addRecipient('ian@aptana.com');
		}
		
		try 
		{
			Jaxer.SMTP.sendMessage('localhost', port, message);
		}
		catch (e)
		{
			Jaxer.Log.info('ERROR SENDING MESSAGE: ' + e.toString());
		}
	},
	
	/**
	 * Performs the appropriate moderation action for a comment
	 * 
	 * Valid actions are:
	 *  - approve
	 *  - delete
	 *  - spam
	 *  - blacklist
	 * 
	 * @param {Number} comment_id
	 * @param {String} action
	 */
	moderateComment: function moderateComment(comment_id, action)
	{
		var comment = Comment.findById(comment_id);
		
		if(!comment)
		{
			return;
		}
		
		switch (action)
		{
			case 'approve':
				// update the comment
				comment.set('approved', true);
				comment.save();
				
				// don't insert them more than once
				if (Jaxer.DB.execute('SELECT COUNT(*) FROM comment_whitelists WHERE email=?', comment.email).singleResult == 0) 
				{
					// whitelist the user
					CommentWhitelist.create({
						email: comment.email
					});
				}
				
				break;
			case 'delete':
				// simply deactivate the comment
				comment.set('is_active', false);
				comment.save();
				break;
			case 'spam':
				// unapprove the comment, and deactivate it
				comment.set('approved', false);
				comment.set('is_active', false);
				comment.save();
				
				// add a blacklist entry
				CommentBlacklist.create({ email: comment.email, reason: 'spam' });
				break;
			case 'blacklist':
				// unapprove the comment, and deactivate it
				comment.set('approved', false);
				comment.set('is_active', false);
				comment.save();
				
				// add a blacklist entry
				CommentBlacklist.create({ email: comment.email, ip: comment.ip, reason: 'abuse' });
				break;
		}
	}
});