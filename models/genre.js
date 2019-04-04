var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GenreSchema = new Schema(
  {
    name: {type: String, required: true,min:3,max:100},
  }
);
// Virtual for genre's URL
GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre';
});

//Export model
module.exports = mongoose.model('Genre', GenreSchema);