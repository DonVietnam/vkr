const fs = require("fs");
const path = require("path");
const { render } = require("./generate");
const http = require("http");

const server = http.createServer(async (request, response) => {
	response.statusCode = 200;
	response.end("Hello!");
});

// const result = render({
// 	name: "Кинчаров Данил Дмитриевич",
// 	phone: "89645242154",
// 	dateOfBirth: "13.10.1999",
// 	gender: "Мужской",
// 	placeOfBirth: "г. Новосибирск",
// 	familyStatus: "Не женат",
// 	type: "Жилое",
// 	ownership: "Частная",
// 	address: "г. Новосибирск, ул. Ленина",
// 	area: "32",
// });

// fs.writeFileSync(path.resolve(__dirname, "output.docx"), result);

server.listen(8088, "127.0.0.1");
