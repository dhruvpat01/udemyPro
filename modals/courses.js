const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	course_name          : {
		type     : String,
		required : true
	},
	email         : {
		type     : String,
		required : true
    },
    course_title  :{
        type     : String,
        required  : true
    },
    course_description:{
        type     : String,
        required  : true
    },
    date:{
        type     :Date,
        required: true
    },
    start_time:{
        type    :String,
        required:true
    },
    end_time:{
        type    :String,
        required:true
    },
    min:{
        type    :Number,
        required:true
    },
    max:{
        type    :Number,
        required:true
    }
	
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;