VideoAttachment = ActiveRecord.create('video_attachments',{
    name: '',
    description: {
        type: 'TEXT'
    },
    size: 0,
    file_name: '',
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});