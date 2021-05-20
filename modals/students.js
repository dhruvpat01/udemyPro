const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
	email         : {
		type     : String,
		required : true
	},
    courses        :{
        type      :JSON,
    }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
