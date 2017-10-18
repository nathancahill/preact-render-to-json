import { render } from '../src';
import { h } from 'preact';
import { expect } from 'chai';

describe('className / class massaging', () => {
	it('should render class using className', () => {
		let rendered = render(<div className="foo bar" />);
		expect(rendered.props).to.have.property('class', 'foo bar');
		expect(rendered.props).to.not.have.property('className');
	});

	it('should render class using class', () => {
		let rendered = render(<div class="foo bar" />);
		expect(rendered.props).to.have.property('class', 'foo bar');
	});

	it('should prefer class over className', () => {
		let rendered = render(<div class="foo" className="foo bar" />);
		expect(rendered.props).to.have.property('class', 'foo');
		expect(rendered.props).to.not.have.property('className');
	});
});
