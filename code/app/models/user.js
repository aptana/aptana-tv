User = ActiveRecord.create('users',{
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    avatar_file: '',
    website: '',
    introduction: {
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
User.actsAsMeta();
User.hasMany('Video');

User.prototype.toSerializableObject = function toSerializableObject()
{
    return ActiveSupport.extend(this.toObject(),{
        meta: this.meta.toObject(),
        videos: this.getVideoList().map(function(video){
            return video.toObject();
        })
    });
};