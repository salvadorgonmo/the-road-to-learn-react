import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import PropTypes from 'prop-types'
import { sortBy } from 'lodash'
import classNames from 'classnames'

const DEFAULT_QUERY = 'redux'
const DEFAULT_HPP = 100
const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='


const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

const updateSearchTopStoriesState = (hits, page) => {
  return (prevState) => {
    {
      const { searchKey, results } = prevState
      const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : []
      const updatedHits = [
        ...oldHits,
        ...hits
      ]

      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
      }
    }
  }
}

class App extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    }
  }

  setSearchTopStories = (result) => {
    const { hits, page } = result
    this.setState(updateSearchTopStoriesState(hits, page))
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

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    }
  }

  onSort = (sortKey) => {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
    this.setState({ sortKey, isSortReverse })
  }

  render () {
    const {
      list,
      onDismiss
     } = this.props
     const {
       sortKey,
       isSortReverse
     } = this.state

     const sortedList = SORTS[sortKey](list)
     const reverseSortedList = isSortReverse
       ? sortedList.reverse()
       : sortedList

     return (
       <div className='table'>
         <div className="table-header">
           <span style={{ width: '40%' }}>
             <Sort
               sortKey={'TITLE'}
               onSort={this.onSort}
               activeSortKey={sortKey}
             > Title
             </Sort>
           </span>
           <span style={{ width: '30%' }}>
             <Sort
               sortKey={'AUTHOR'}
               onSort={this.onSort}
               activeSortKey={sortKey}
             >
             Author
             </Sort>
           </span>
           <span style={{ width: '10%' }}>
             <Sort
               sortKey={'COMMENTS'}
               onSort={this.onSort}
               activeSortKey={sortKey}
             >
               Comments
             </Sort>
           </span>
           <span style={{ width: '10%' }}>
             <Sort
               sortKey={'POINTS'}
               onSort={this.onSort}
               activeSortKey={sortKey}
             > Points
             </Sort>
           </span>
           <span style={{ width: '10%' }}>
             Archive
           </span>
         </div>
         {reverseSortedList.map(item => (
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
         )}
       </div>
     )
  }
}


const Loading = () => (
  <span style={{fontSize: '100px'}}>
    <i className="fas fa-spinner"></i>
  </span>
)

const Sort = ({
  sortKey,
  onSort,
  children,
  activeSortKey
}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  )
  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}>
      {children}
    </Button>
  )
}

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
