LearningPath = ActiveRecord.create('learning_paths',{
    name: '',
	slug: '',
    description: {
        type: 'TEXT'
    },
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
LearningPath.hasMany('LearningPathItem');
LearningPath.hasMany('Video', {
    through: 'LearningPathItem'
});