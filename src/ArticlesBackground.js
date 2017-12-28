import React, { Component } from 'react';
import candy_cane from './assets/candy_cane.png';
import candy_small from './assets/candy_small.png';
import candy from './assets/candy.png';

const styles = {
    item: {
        backgroundRepeat: 'no-repeat',
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.2
    }
}

/**
 * Articles background.
 */
export default class ArticlesBackground extends React.Component {
    state = {
        scrollOffset: 0
    }
    
    constructor(props) {
        super(props);

        window.addEventListener('scroll', (ev) => {
            const doc = window.document;
            this.setState({
                scrollOffset: (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
            })
        });
    }

    /**
     * Gets the scroll offset for a background item.
     * @param {Number} factor 
     */
    scrollOffset(factor, offset){
        var offset = -this.state.scrollOffset * factor + offset;
        while (offset < -400) {
            offset += window.innerHeight + 400;
        }
        return offset;
    }

    /**
     * Generates an item style.
     * @param scrollFactor {Number} factor in scroll offset.
     * @param rotation {Number} rotation in degrees
     * @param x {Number} offset x
     * @param y {Number} offset y
     */
    itemStyle(scrollFactor, rotation, x, y){
        y = this.scrollOffset(scrollFactor, y);
        return Object.assign({}, styles.item, {
            transform: 'translate(' + x + 'px, ' + y + 'px) rotate(' + rotation + 'deg)'
        })
    }

    componentWillReceiveProps(next){
        const scrollOffset = next.scrollOffset;
    }

    render(){
        let state = this.state;
        return (
            <div>
                <img src={candy_cane} style={this.itemStyle(0.9, 10, window.innerWidth * 0.25, window.innerHeight * 0.25)} />
                <img src={candy_small} style={this.itemStyle(0.825, -10, window.innerWidth * 0.6, window.innerHeight * 0.75)} />
                <img src={candy_small} style={this.itemStyle(1, 0, window.innerWidth * 0.33, window.innerHeight * 0.75)} />
                <img src={candy} style={this.itemStyle(0.95, 10, window.innerWidth * 0.75, window.innerHeight * 1.43)} />
            </div>
        );
    }
}