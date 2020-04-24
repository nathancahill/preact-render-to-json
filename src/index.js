import { options, Fragment, createElement } from 'preact';
import { falsey, flatMap, assign, getChildren, omit } from './util';

const SHALLOW = { shallow: true };

// components without names, kept as a hash for later comparison to return consistent UnnamedComponentXX names.
const UNNAMED = [];

const EMPTY = {};

const noop = () => {};


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
export let shallowRender = (vnode, context) => renderToJSON(vnode, context, SHALLOW);

export const render = renderToJSON;


/** The default export is an alias of `render()`. */
export default function renderToJSON(vnode, context, opts, inner) {
	if (vnode==null || typeof vnode==='boolean') {
		return null;
	}

	// wrap array nodes in Fragment
	if (Array.isArray(vnode)) {
		vnode = createElement(Fragment, null, vnode);
	}

	let { type: nodeName, props } = vnode || EMPTY,
		isComponent = false;
	context = context || {};
	opts = opts || {};

	// #text nodes
	if (typeof vnode!=='object' && !nodeName) {
		return vnode;
	}

	// components
	if (typeof nodeName==='function') {
		isComponent = true;
		if (opts.shallow && (inner || opts.renderRootComponent===false)) {
			nodeName = getComponentName(nodeName);
		}
		else if (nodeName===Fragment) {
			let children = [];
			getChildren(children, vnode.props.children);
			return flatMap(children, child => renderToJSON(child, context, opts, true));
		}
		else {
			let rendered;

			let c = vnode.__c = {
				__v: vnode,
				context,
				props: vnode.props,
				// silently drop state updates
				setState: noop,
				forceUpdate: noop,
				// hooks
				__h: []
			};

			// options.render
			if (options.__r) options.__r(vnode);

			if (!nodeName.prototype || typeof nodeName.prototype.render!=='function') {
				// Necessary for createContext api. Setting this property will pass
				// the context value as `this.context` just for this component.
				let cxType = nodeName.contextType;
				let provider = cxType && context[cxType.__c];
				let cctx = cxType != null ? (provider ? provider.props.value : cxType.__) : context;

				// stateless functional components
				rendered = nodeName.call(vnode.__c, props, cctx);
			}
			else {
				// class-based components
				let cxType = nodeName.contextType;
				let provider = cxType && context[cxType.__c];
				let cctx = cxType != null ? (provider ? provider.props.value : cxType.__) : context;

				// c = new nodeName(props, context);
				c = vnode.__c = new nodeName(props, cctx);
				c.__v = vnode;
				// turn off stateful re-rendering:
				c._dirty = c.__d = true;
				c.props = props;
				if (c.state==null) c.state = {};

				if (c._nextState==null && c.__s==null) {
					c._nextState = c.__s = c.state;
				}

				c.context = cctx;
				if (nodeName.getDerivedStateFromProps) c.state = assign(assign({}, c.state), nodeName.getDerivedStateFromProps(c.props, c.state));
				else if (c.componentWillMount) c.componentWillMount();

				// If the user called setState in cWM we need to flush pending,
				// state updates. This is the same behaviour in React.
				c.state = c._nextState !== c.state
					? c._nextState : c.__s!==c.state
						? c.__s : c.state;

				rendered = c.render(c.props, c.state, c.context);
			}

			if (c.getChildContext) {
				context = assign(assign({}, context), c.getChildContext());
			}

			return renderToJSON(rendered, context, opts, opts.shallowHighOrder!==false);
		}
	}

	let children = [];
	getChildren(children, props.children);

	const truthyChildren = children.filter(child => !falsey(child));
	const pieces = flatMap(truthyChildren, child => (renderToJSON(child, context, opts, true) || []));

	let ret = {
		$$typeof: Symbol.for('react.test.json'),
		type: nodeName
	};

	if (props) {
		ret.props = omit(props, ['key', 'children', 'className']);

		if (props.className && !props.class) {
			ret.props.class = props.className;
		}
	}

	if (props && props.key) {
		ret.key = props.key;
	}

	if (pieces.length) {
		ret.children = pieces;
	}

	return ret;
}

function getComponentName(component) {
	return component.displayName || component!==Function && component.name || getFallbackComponentName(component);
}

function getFallbackComponentName(component) {
	let str = Function.prototype.toString.call(component),
		name = (str.match(/^\s*function\s+([^( ]+)/) || '')[1];
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
