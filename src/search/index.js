import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common';
import logo from '../images/big.png';
import { a } from './tree-shaking';
import './index.less';

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Text: null,
    };
  }

  loadComponent = () => {
        import('./text.js').then((Text) => this.setState({ Text: Text.default }));
  };

  render() {
    const { Text } = this.state;
    const funcA = a();
    return (
      <div className="search-text">
        {
          Text ? <Text /> : null
        }
        {funcA}
        搜索文字的内容
        <img src={logo} onKeyDown={this.loadComponent} alt="" />
      </div>
    );
  }
}

ReactDOM.render(
  <Search />,
  document.getElementById('root'),
);
