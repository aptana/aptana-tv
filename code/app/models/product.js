Product = ActiveRecord.create('products',{
    name: '',
    url: '',
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
Product.hasMany('Version');
Product.hasMany('Video');

Product.prototype.toSerializableObject = function toSerializableObject()
{
    return ActiveSupport.extend(this.toObject(),{
        videos: this.getVideoList().map(function(video){
            return video.toObject();
        }),
        versions: this.getVersionList().map(function(version){
            return version.toObject();
        })
    });
};