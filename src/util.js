
export let falsey = v => v==null || v===false;

export function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return obj;
}

export function getNodeProps(vnode) {
	let defaultProps = vnode.nodeName.defaultProps,
		props = assign({}, defaultProps || vnode.attributes);
	if (defaultProps) assign(props, vnode.attributes);
	if (vnode.children) props.children = vnode.children;
	return props;
}
