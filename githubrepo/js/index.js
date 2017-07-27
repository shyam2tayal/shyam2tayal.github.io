'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = React.Component;

var App = function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      username: 'shyam2tayal',
      realName: '',
      avatar: '',
      location: '',
      repos: '',
      followers: '',
      url: '',
      notFound: ''
    };
    return _this;
  }

  App.prototype.render = function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(SearchBox, { fetchUser: this.fetchUser.bind(this) }),
      React.createElement(Card, { data: this.state })
    );
  };

  // the api request function

  App.prototype.fetchApi = function fetchApi(url) {
    var _this2 = this;

    fetch(url).then(function (res) {
      return res.json();
    }).then(function (data) {

      // update state with API data
      _this2.setState({
        username: data.login,
        realName: data.name,
        avatar: data.avatar_url,
        location: data.location,
        repos: data.public_repos,
        followers: data.followers,
        url: data.html_url,
        notFound: data.message
      });
    }).catch(function (err) {
      return console.log('oh no!');
    });
  };

  App.prototype.fetchUser = function fetchUser(username) {
    var url = 'https://api.github.com/users/' + username;
    this.fetchApi(url);
  };

  App.prototype.componentDidMount = function componentDidMount() {
    var url = 'https://api.github.com/users/' + this.state.username;
    this.fetchApi(url);
  };

  return App;
}(Component);

var SearchBox = function (_Component2) {
  _inherits(SearchBox, _Component2);

  function SearchBox() {
    _classCallCheck(this, SearchBox);

    return _possibleConstructorReturn(this, _Component2.apply(this, arguments));
  }

  SearchBox.prototype.render = function render() {
    return React.createElement(
      'form',
      {
        className: 'searchbox',
        onSubmit: this.handleClick.bind(this) },
      React.createElement('input', {
        ref: 'search',
        className: 'searchbox__input',
        type: 'text',
        placeholder: 'type username...' }),
      React.createElement('input', {
        type: 'submit',
        className: 'searchbox__button',
        value: 'Search GitHub User' })
    );
  };

  SearchBox.prototype.handleClick = function handleClick(e) {
    e.preventDefault();
    var username = this.refs.search.getDOMNode().value;
    // sending the username value to parent component to fetch new data from API
    this.props.fetchUser(username);
    this.refs.search.getDOMNode().value = '';
  };

  return SearchBox;
}(Component);

var Card = function (_Component3) {
  _inherits(Card, _Component3);

  function Card() {
    _classCallCheck(this, Card);

    return _possibleConstructorReturn(this, _Component3.apply(this, arguments));
  }

  Card.prototype.render = function render() {
    var data = this.props.data;

    if (data.notFound === 'Not Found') {
      // when username is not found...
      return React.createElement(
        'h3',
        { className: 'card__notfound' },
        'User not found. Try again!'
      );
    } else {
      // if username found, then...
      return React.createElement(
        'div',
        { className: 'card' },
        React.createElement(
          'a',
          { href: data.url, target: '_blank' },
          React.createElement('img', { className: 'card__avatar', src: data.avatar })
        ),
        React.createElement(
          'h2',
          { className: 'card__username' },
          React.createElement(
            'a',
            { className: 'card__link', href: data.url, target: '_blank' },
            data.username
          )
        ),
        React.createElement(
          'dl',
          null,
          React.createElement(
            'dt',
            null,
            'Real name'
          ),
          React.createElement(
            'dd',
            null,
            data.realName
          ),
          React.createElement(
            'dt',
            null,
            'Location'
          ),
          React.createElement(
            'dd',
            null,
            data.location
          ),
          React.createElement(
            'dt',
            null,
            'Number of public repos'
          ),
          React.createElement(
            'dd',
            null,
            data.repos
          ),
          React.createElement(
            'dt',
            null,
            'Number of followers'
          ),
          React.createElement(
            'dd',
            null,
            data.followers
          )
        )
      );
    }
  };

  return Card;
}(Component);

React.render(React.createElement(App, null), document.getElementById('app'));
