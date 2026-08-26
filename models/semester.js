const mongoose = require('mongoose');
const { Schema } = mongoose;

const semesterSchema = new Schema({
  semester: { type: String, required: true }, // e.g. "Semester 1"
  sgpa: { type: String },
  filePath: { type: String, required: true }, // e.g. /uploads/marksheets/xxx.pdf
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Semester', semesterSchema);
