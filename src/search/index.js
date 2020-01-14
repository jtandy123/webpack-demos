'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import '../../common';
import logo from '../images/big.png';
import { a } from './tree-shaking';
import './index.less';

class Search extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            Text: null
        };
    }

    loadComponent() {
        import('./text.js').then((Text) => this.setState({ Text: Text.default }));
    }

    render() {
        const { Text } = this.state;
        return <div className="search-text">
            {
                Text ? <Text /> : null
            }
            {a()}
            搜索文字的内容
            <img src={logo} onClick={this.loadComponent.bind(this)} />
            {a()}
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
);