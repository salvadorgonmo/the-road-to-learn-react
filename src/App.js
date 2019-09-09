import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import PropTypes from 'prop-types'

const DEFAULT_QUERY = 'redux'
const DEFAULT_HPP = 100
const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='


class App extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
    }
  }

  setSearchTopStories = (result) => {
    const { hits, page } = result
    const { searchKey, results } = this.state

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : []
    const updatedHits = [
      ...oldHits,
      ...hits
    ]

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
    })
  }

  onDismiss = id => {
    const { searchKey, results } = this.state
    const { hits, page } = results[searchKey]
    const updatedHits = hits.filter(item => item.objectID !== id)

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    })
  }

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true })
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }))
  }

  needsToSearchTopStories = (searchTerm) => {
    return !this.state.results[searchTerm]
  }

  onSearchSubmit = evt => {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm)
    }
    evt.preventDefault()
  }

  componentDidMount = () => {
    this._isMounted = true
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm)
  }

  componentWillUnmount = () => {
    this._isMounted = false
  }

  onSearchChange = evt => {
    this.setState({searchTerm: evt.target.value})
  }

  render() {
    const {
      results,
      searchTerm,
      searchKey,
      error,
      isLoading
    } = this.state

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || []

    return (
      <div className="page">
        <div className='interactions'> 
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          > Search </Search>
          { error 
            ? <div className='interactions'>
                <p> Something went wrong. </p>
              </div>
            : <Table
                list={list}
                onDismiss={this.onDismiss}
              />
          }
          <div className='interactions'>
          { <ButtonWithLoading
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} 
            > More
            </ButtonWithLoading>
          }
          </div>
        </div>
      </div> 
    )
  }
}


class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  render() {
    const {
      children,
      value,
      onChange,
      onSubmit
    } = this.props

    return (
      <form onSubmit={onSubmit}> 
        <input 
          type='text'
          value={value}
          onChange={onChange}
          ref={el => this.input = el} />
        <button type='submit'>
          {children}
        </button>
    </form>
    )
  }
}

const Table  = ({ list, onDismiss }) => 
  <div className='table'>
    {list.map(item => {
      return (
        <div key={item.objectID} className='table-row'> 
          <span style={{ width: '40%'}}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{ width: '30%'}}>{item.author}</span>
          <span style={{ width: '10%'}}>{item.num_comments}</span>
          <span style={{ width: '10%'}}>{item.points}</span>
          <span style={{ width: '10%'}}> 
            <Button 
              onClick = {() => onDismiss(item.objectID)}
              type='button'
              className='button-inline'> 
                Dismiss
            </Button>
          </span>
        </div> 
      )
    })}
  </div>

const Loading = () => (
  <span style={{fontSize: '100px'}}>
    <i className="fas fa-spinner"></i>
  </span>
)


const Button = ({ 
  onClick,
  className,
  children
}) =>
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>

const withLoading = (Component) => ({isLoading, ...rest}) => (
  isLoading
    ? <Loading />
    : <Component { ...rest} />
)

const ButtonWithLoading = withLoading(Button)

Button.defaultProps = {
  className: ''
}
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      point: PropTypes.number
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired
}

export default App;

export {
  Button,
  Search,
  Table
}
