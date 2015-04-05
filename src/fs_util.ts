import fs = require('fs');
import fs_extra = require('fs-extra');
import path = require('path');

export function cleanDir(dir: string, filter?: (path: string) => boolean) {
	var files = fs.readdirSync(dir);
	files.forEach((file) => {
		var filePath = path.resolve(`${dir}/${file}`);
		if (!filter || filter(filePath)) {
			fs_extra.removeSync(filePath);
		}
	});
}

export function isRelative(filePath: string) {
	return path.normalize(filePath) !== path.resolve(filePath);
}
