define([],
       function() {
           // this is very strange.  don't ask. don't ever ever ask.
           window.gdata = { io:{ handleScriptLoaded:function(x) { return x; }}  };
           var SpreadSheet = function(id) {
               this.id = id;
               this.url = "https://spreadsheets.google.com/feeds/cells/" + id + "/od6/public/basic?alt=json-in-script";
           };
           var to_objects = function(cells) {
               // first filter for cell names
               var are = /A[\d]+/g;
               var propertynames = {};
               cells.filter(function(c) {
                                var test = (/([A-Z]+)1$/g).exec(c.title);
                                if (test && test[1]){
                                    var col = test[1];
                                    propertynames[test[1]] = c.content;
                                }
                            });
               var get_rowcol = function(title) {
                   var test = (/([A-Z]+)([\d]+)$/g).exec(title);
                   if (test && test[1] && test[2]){
                       return { col: test[1], row: parseInt(test[2]) };
                   }
                   return;
               };
               var entities = [];
               cells.map(function(c) {
                             var cellloc = get_rowcol(c.title);
                             if (!cellloc ) { console.log("warning skipping ", c.title);  }
                             var entity = entities[cellloc.row] || {};
                             var prop = propertynames[cellloc.col];
                             entity[prop] = c.content;
                             entities[cellloc.row] = entity;
                         });
               return entities.slice(2);
           };           
           SpreadSheet.prototype = {
               fetch:function() {
                   var this_ = this;
                   var D = new $.Deferred();
                   $.ajax({
                              url:this.url, type:"GET", datatype:"jsonp", jsonp: false // , jsonpCallback: "gdata.io.handleScriptLoaded"
                          }).
                       then(function(data) {
                                window.GOT = data;
                                data = JSON.parse(data.slice(28,-2));
                                var convert_vals = function(obj) {
                                    var new_obj = {};
                                    _(obj).map(function(v,k) { new_obj[k] = v && v['$t'] ? v['$t'] : v; });
                                    return new_obj;
                                };
                                D.resolve(to_objects(data.feed.entry.map(convert_vals)));
                            }).fail(function(x,y, z) { console.log("ERROR ", x,y,z); });;
                   return D.promise();
               }
           };
           return {
               SpreadSheet: SpreadSheet
           };
       });
    