const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.resolve(__dirname, "TestTemplate.docx"), "binary");

const zip = new PizZip(content);

module.exports.render = (data) => {
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
	});

	doc.render(data);

	return doc.getZip().generate({
		type: "nodebuffer",
		compression: "DEFLATE",
	});
};
