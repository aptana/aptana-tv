CommentBlacklist = ActiveRecord.create('comment_blacklists', {
	ip: '',
	email: '',
	reason: 'spam',
	created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true	
});