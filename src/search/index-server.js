const React = require('react');
const logo = require('../images/big.png');
require('./index.less');

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Text: null,
    };
  }

  loadComponent = () => {
        import('./text.js').then(Text => this.setState({ Text: Text.default }));
  };

  render() {
    const { Text } = this.state;
    return (
      <div className="search-text">
        {
          Text ? <Text /> : null
        }
        搜索文字的内容
        <img src={logo} onKeyDown={this.loadComponent} alt="" />
      </div>
    );
  }
}

module.exports = <Search />;
