define([],
       function() {
           var Twetter  = function(userid) {
               this.userid = userid;
           };

           Twetter.prototype = {
               count:50,
               rts:false,
               get_url:function() {
                   return  "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts="+this.rts+"&screen_name="+this.userid+"&count="+this.count;
               },               
               fetch:function() {
                   var d = new $.Deferred();
                   var this_ = this;
                   $.ajax({url: this.get_url(), dataType:"jsonp"}).pipe(function(x) { return this_.convert(x); }).then(d.resolve);
                   return d.promise();
               },
               convert : function(data) {
                   var this_ = this;
                   return data.filter(function(x) { return x.user_mentions == null || x.user_mentions.length == 0; })
                       .map(function(x) {
                                return {
                                    type:"tweet",
                                    id:x.id,
                                    published_on: x.created_at,
                                    posted: x.created_at,
                                    link1: "https://twitter.com/#!/"+this_.userid+"/status/"+x.id_str,
                                    link1_label:"see original tweet",
                                    "title": x.text.slice(0,30).concat("..."),
                                    "abstract":x.text
                                };
                            });                        
               }               
           };
           return {
               Twetter:Twetter
           };           
       });