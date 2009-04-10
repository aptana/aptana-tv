CommentWhitelist = ActiveRecord.create('comment_whitelists', {
	email: '',
	created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
