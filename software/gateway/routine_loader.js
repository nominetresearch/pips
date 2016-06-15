var fs = require('fs');

module.exports = function getRoutineFromFile(user_id, callback){

	var routine = fs.readFileSync("../pips_routine.json").toString();

	callback(null, routine);

}