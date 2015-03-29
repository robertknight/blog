import fs = require('fs');
import fs_extra = require('fs-extra');
import path = require('path');

export function cleanDir(dir: string) {
	var files = fs.readdirSync(dir);
	files.forEach((file) => {
		var filePath = path.resolve(`${dir}/${file}`);
		fs_extra.removeSync(filePath);
	});
}


