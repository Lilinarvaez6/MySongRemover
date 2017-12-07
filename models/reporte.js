
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reporteSchema = Schema({
	idLista: String,
	idCancion: String
})


// para asingar el modelo con el nombre que le damos al Schema
module.exports = mongoose.model('reporte', reporteSchema)