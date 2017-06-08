import { encodeEntities, falsey, assign, getNodeProps } from './util';

const SHALLOW = { shallow: true };

// components without names, kept as a hash for later comparison to return consistent UnnamedComponentXX names.
const UNNAMED = [];

const EMPTY = {};


/** Render Preact JSX + Components to an HTML string.
 *	@name render
 *	@function
 *	@param {VNode} vnode	JSX VNode to render.
 *	@param {Object} [context={}]	Optionally pass an initial context object through the render path.
 *	@param {Object} [options={}]	Rendering options
 *	@param {Boolean} [options.shallow=false]	If `true`, renders nested Components as HTML elements (`<Foo a="b" />`).
 */
renderToJSON.render = renderToJSON;


/** Only render elements, leaving Components inline as `<ComponentName ... />`.
 *	This method is just a convenience alias for `render(vnode, context, { shallow:true })`
 *	@name shallow
 *	@function
 *	@param {VNode} vnode	JSX VNode to render.
 *	@param {Object} [context={}]	Optionally pass an initial context object through the render path.
 */
let shallowRender = (vnode, context) => renderToJSON(vnode, context, SHALLOW);


/** The default export is an alias of `render()`. */
export default function renderToJSON(vnode, context, opts, inner) {
	let { nodeName, attributes, children } = vnode || EMPTY,
		isComponent = false;
	context = context || {};
	opts = opts || {};

	if (vnode==null || vnode===false) {
		return EMPTY;
	}

	// #text nodes
	if (!nodeName) {
		return encodeEntities(vnode);
	}

	// components
	if (typeof nodeName==='function') {
		isComponent = true;
		if (opts.shallow && (inner || opts.renderRootComponent===false)) {
			nodeName = getComponentName(nodeName);
		}
		else {
			let props = getNodeProps(vnode),
				rendered;

			if (!nodeName.prototype || typeof nodeName.prototype.render!=='function') {
				// stateless functional components
				rendered = nodeName(props, context);
			}
			else {
				// class-based components
				let c = new nodeName(props, context);
				// turn off stateful re-rendering:
				c._disable = c.__x = true;
				c.props = props;
				c.context = context;
				if (c.componentWillMount) c.componentWillMount();
				rendered = c.render(c.props, c.state, c.context);

				if (c.getChildContext) {
					context = assign(assign({}, context), c.getChildContext());
				}
			}

			return renderToJSON(rendered, context, opts, opts.shallowHighOrder!==false);
		}
	}

	let pieces = [];
	let len = children && children.length;
	for (let i=0; i<len; i++) {
		let child = children[i];
		if (!falsey(child)) {
			let ret = renderToJSON(child, context, opts, true);
			if (ret) pieces.push(ret);
		}
	}

	let ret = {
		$$typeof: Symbol.for('react.test.json'),
		type: nodeName
	};

	if (attributes) {
		ret.props = attributes;
	}

	if (pieces.length) {
		ret.children = pieces;
	}

	return ret;
}

function getComponentName(component) {
	let proto = component.prototype,
		ctor = proto && proto.constructor;
	return component.displayName || component.name || (proto && (proto.displayName || proto.name)) || getFallbackComponentName(component);
}

function getFallbackComponentName(component) {
	let str = Function.prototype.toString.call(component),
		name = (str.match(/^\s*function\s+([^\( ]+)/) || EMPTY)[1];
	if (!name) {
		// search for an existing indexed name for the given component:
		let index = -1;
		for (let i=UNNAMED.length; i--; ) {
			if (UNNAMED[i]===component) {
				index = i;
				break;
			}
		}
		// not found, create a new indexed name:
		if (index<0) {
			index = UNNAMED.push(component) - 1;
		}
		name = `UnnamedComponent${index}`;
	}
	return name;
}
renderToJSON.shallowRender = shallowRender;


export {
	renderToJSON as render,
	renderToJSON,
	shallowRender
};
