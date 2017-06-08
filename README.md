# preact-render-to-json

Render JSX and [Preact] components to JSON. Useful for [Jest Snapshot testing].

### Usage with Jest

```js
import preact from 'preact'
import render from 'preact-render-to-json'

/** @jsx preact.h */

let component = <div class="foo">content</div>;

test('component', () => {
	const tree = render(component)
	expect(tree).toMatchSnapshot()
})
```

### License

[MIT]

[Preact]: https://github.com/developit/preact
[Jest Snapshot testing]: https://facebook.github.io/jest/docs/snapshot-testing.html
[MIT]: http://choosealicense.com/licenses/mit/