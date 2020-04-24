
export let falsey = v => v==null || v===false;

export function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return obj;
}

export function flatMap(array, callback) {
	const result = [];

	const length = array.length;
	for (let index = 0; index < length; index++) {
		const mapped = callback(array[index]);
		if (Array.isArray(mapped)) {
			result.push(...mapped);
		} else {
			result.push(mapped);
		}
	}

	return result;
}

/**
 * Get flattened children from the children prop
 * @param {Array} accumulator
 * @param {any} children A `props.children` opaque object.
 * @returns {Array} accumulator
 * @private
 */
export function getChildren(accumulator, children) {
	if (Array.isArray(children)) {
		children.reduce(getChildren, accumulator);
	}
	else if (children!=null && children!==false) {
		accumulator.push(children);
	}
	return accumulator;
}

export const omit = (object, paths) =>
	Object.keys(object)
		.reduce((result, key) => {
			if (!paths.includes(key)) {
				result[key] = object[key]; // eslint-disable-line no-param-reassign
			}

			return result;
		}, {});
