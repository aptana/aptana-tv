ModalController = ActiveController.create({
	/**
	 * Profiles are modified inside a modal window
	 */
	layout: {
		file: 'layouts/layout_modal.html'
	},
	
	/**
	 * Shows the embed a video modal dialog
	 */
	embed: function embed()
	{
		var c = new OembedController;
		var video = Video.findBySlug(this.params.slug);
        
		c.params = {
            url: urlencode('http://' + Jaxer.request.env.HTTP_HOST + videoUrl({
                slug: video.slug
            }))
        }
		
		var embed_data = c.getOembedData(video);
		
		this.set('html', embed_data.html);
		
		this.render({
			file: 'modals/embed.html'
		});
	},
	
	/**
	 * Shows the share a video modal dialog
	 */
	share: function share()
	{
		var video = Video.findBySlug(this.params.slug);
		
		if(typeof(this.params.doShare) != 'undefined' && this.params.doShare == 1)
		{
			var to 		= this.params.email_to;
			var from 	= this.params.name + '<' + this.params.email_from + '>';
			var subject	= '[Aptana TV] ' + this.params.name + ' has shared a video with you';
			
			var mail = new Jaxer.SMTP.MailMessage();
				
			mail.setFrom(from);
			mail.addRecipient(to);
			mail.setSubject(subject);
			mail.setBody(this.params.message);
			
			try 
			{
				Jaxer.SMTP.sendMessage('localhost', Jaxer.SMTP.DEFAULT_PORT, mail);
			}
			catch (e)
			{
				Jaxer.Log.info('ERROR SENDING MESSAGE: ' + e.toString());
			}
			
			this.set('sent', true);
		}
		else
		{
			this.set('sent', false);
		}
		
		this.set('video', video);
		
		this.render({
			file: 'modals/share.html'
		});
	},
	
	/**
	 * Shows the suggest a video form, and processes it
	 */
	suggest: function suggest()
	{
		if(typeof(this.params.doSuggest) && this.params.doSuggest == 1)
		{
			var to 		= 'ian@aptana.com';
			var from 	= 'Aptana TV <no-reply@aptana.tv>';
			var subject	= '[Aptana TV] A new video suggestion has been submitted';
			var name 	= this.params.name;
			var email 	= this.params.email;
			var message	= this.params.suggestion;
			
			if(name == '' || email == '' || body == '')
			{
				this.render({
					file: 'modals/suggest_form.html'
				});
			}
			else
			{
				var body = 'A new video has been requested!\n\n';
				body += 'Author: ' + name + '\n';
				body += 'Email: ' + email + '\n';
				body += 'Suggestion:\n' + message;
				
				var mail = new Jaxer.SMTP.MailMessage();
				
				mail.setFrom(from);
				mail.addRecipient(to);
				mail.addRecipient('paul@aptana.com');
				mail.setSubject(subject);
				mail.setBody(body);
				
				try 
				{
					Jaxer.SMTP.sendMessage('localhost', Jaxer.SMTP.DEFAULT_PORT, mail);
				}
				catch (e)
				{
					Jaxer.Log.info('ERROR SENDING MESSAGE: ' + e.toString());
				}
				
				this.render({
					file: 'modals/suggest_success.html'
				});
			}
		}
		else
		{
			this.render({
				file: 'modals/suggest_form.html'
			});
		}
	}
})
