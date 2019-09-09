import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer'
import App, { Search, Button, Table } from './App'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  
  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Search', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Search>Search</Search>, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Button', () => {
  const onClick = () => {}
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Search>Search</Search>, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button onClick={onClick}>Give me more</Button>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows a text as a children', () => {
    const element = shallow(
      <Button onClick={onClick} className='button-inline'> Give me more </Button>
    )

    expect(element.find('.button-inline').length).toBe(1)
  })
})


describe('Table', () => {
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }
    ]
  }

  const onDismiss = () => {}

  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Table onDismiss={onDismiss}{ ...props} />, div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table onDismiss={onDismiss} { ...props} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows two items in list', () => {
    const element = shallow(
      <Table onDismiss={onDismiss} { ...props } />
    )

    expect(element.find('.table-row').length).toBe(2)
  })
})