Category = ActiveRecord.create('categories',{
    name: '',
    slug: '',
	description: '',
	image: '',
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
Category.hasMany('Categorization');
Category.hasMany('videos',{
    through: 'categorizations'
});

Category.prototype.toSerializableObject = function toSerializableObject()
{
    return ActiveSupport.extend(this.toObject(),{
        videos: this.getVideoList().map(function(video){
            return video.toObject();
        })
    });
};