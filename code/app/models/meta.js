Meta = ActiveRecord.create('meta',{
    model_name: '',
    instance_id: 0,
    name: '',
    value: ''
});

ActiveRecord.ActsAsMeta = {
    setupMetaData: function setupMetaData()
    {
        this.meta = {
            _object: {},
            set: ActiveSupport.bind(function set(key,value){
                this.meta._object[key] = value;
                var meta = Meta.find({
                    where: {
                        model_name: this.modelName,
                        instance_id: this.get('id'),
                        name: key
                    }
                });
                if(!meta)
                {
                    Meta.create({
                        model_name: this.modelName,
                        instance_id: this.get('id'),
                        name: key,
                        value: value
                    });
                }
                else
                {
                    meta.set('value',value);
                    meta.save();
                }
                return value;
            },this),
            get: ActiveSupport.bind(function get(key){
                return this.meta._object[key];
            },this),
            toObject: ActiveSupport.bind(function toObject(){
                return this.meta._object;
            },this)
        };
    },
    loadMetaData: function loadMetaData()
    {
        if(this.id){
            var meta_data = Meta.find({
                all: true,
                where: {
                    model_name: 'Video',
                    instance_id: this.id
                }
            });
            for(var i = 0; i < meta_data.length; ++i)
            {
                this.meta._object[meta_data[i].name] = meta_data[i].value;
            }
        }
    }
};

ActiveRecord.ClassMethods.actsAsMeta = function actsAsMeta()
{
    ActiveSupport.extend(this.prototype,ActiveRecord.ActsAsMeta);
    this.observe('afterInitialize',function(record){
        record.setupMetaData();
        record.loadMetaData();
    });
};