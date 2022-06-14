const fs = require("fs");
const path = require("path");
const { render } = require("./generate");
const http = require("http");
const crypto = require("crypto");

const templates = new Set(["Общая информация"]);
const cases = new Map();
const stages = new Set(["В ОЖИДАНИИ", "В ПРОЦЕССЕ", "НА ПРОВЕРКЕ", "ВЫПОЛНЕНО", "ИСПРАВЛЕНИЕ"]);
const stageTemplate = new Map();
const caseValues = new Map();
const last = "ВЫПОЛНЕНО";
const caseFile = new Map();

const getBody = async (request) => {
	const buffers = [];
	for await (const chunk of request) {
		buffers.push(chunk);
	}

	return Buffer.concat(buffers);
};

const parseBody = async (request) => {
	const buffer = await getBody(request);
	return JSON.parse(buffer.toString("utf-8"));
};

const router = {
	"case/add": async ({ name }) => {
		const id = crypto.randomUUID();
		const newCase = { name, id, stage: "В ОЖИДАНИИ" };
		cases.set(id, newCase);
		return newCase;
	},

	"stage/addTemplate": async ({ stage, templateName }) => {
		if (stages.has(stage) && templates.has(templateName)) {
			stageTemplate.set(stage, templateName);
			return { stage, templateName, author: "danil" };
		} else {
			return null;
		}
	},

	"case/addValue": async ({ caseId, values }) => {
		if (cases.has(caseId)) {
			prevValues = caseValues.has(caseId) ? caseValues.get(caseId) : {};
			caseValues.set(caseId, { ...prevValues, ...values });
			const filled = Object.keys({ ...prevValues, ...values }).length;
			const left = 10 - filled;
			return { caseId, filled, left };
		}
		return null;
	},

	"case/changeStage": async ({ caseId, stage }) => {
		if (cases.has(caseId) && stages.has(stage)) {
			const caseObject = cases.get(caseId);
			caseObject.stage = stage;
			const generatedDocuments = [stageTemplate.get(stage)];
			caseFile.set(caseId, render(caseValues.get(caseId)));
			return { caseId, stage, final: stage === last, generatedDocuments };
		}

		return null;
	},

	"case/getFile": async ({ caseId, name }) => {
		if (caseFile.has(caseId) && templates.has(name)) {
			return { file: true, binary: caseFile.get(caseId) };
		}

		return null;
	},
};

const callMethod = async (data) => {
	const result = await router[data.method](data.params);
	if (result && result.file) {
		return result;
	}
	return { id: data.id, result };
};

const server = http.createServer(async (request, response) => {
	try {
		const body = await parseBody(request);
		const result = await callMethod(body);
		response.statusCode = 200;
		if (result.file) {
			response.setHeader("content-disposition", "attachment; filename=document.docx");
			response.end(result.binary);
		} else {
			response.end(JSON.stringify(result));
		}
	} catch (error) {
		console.log(error);
		response.statusCode = 200;
		response.end(JSON.stringify({ error: "Internal server error." }));
	}
});

server.listen(8088);
