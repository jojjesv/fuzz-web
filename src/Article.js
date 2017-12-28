import React, { Component } from 'react';
import './Articles.css'
import gloss from './assets/gloss.png'

const glossBackground = 'url(' + gloss + ')';

/**
 * Single article.
 */
export default class Article extends React.Component {
    render(){
        let props = this.props;
        let darkTheme = props.dark || false;

        return (
            <div className={"article" + (props.infoCallback || props.addToCartCallback ? " hide-cost-hover" : "")}>
                <div>
                    {
                        (!props.removable && (true || props.isNew)) &&
                        (
                            <p className="new-badge">Nyhet</p>
                        )
                    }
                    {
                        props.quantity && props.quantity > 1 &&
                        (
                            <p className="quantity-badge">{props.quantity} st</p>
                        )
                    }
                    {
                        (props.removable) &&
                        (   
                            <a className="remove-badge hover-scale" onClick={
                                (e) => {
                                    this.props.onRemoveItem();
                                }}></a>
                        )
                    }
                    <div className="thumbnail" style={ { backgroundImage: glossBackground + ',url(' + props.image + ')' } }>
                        
                    </div>
                 
                </div>
                <h2 className={"name " + (darkTheme ? "dark shadowed" : "")}>{ props.name }</h2>
                <h3 className="cost">{ props.cost }kr</h3>
                {
                    props.infoCallback &&
                    (
                        <button onClick={props.infoCallback}></button>
                    )
                }
                {
                    props.addToCartCallback &&
                    (
                        <button onClick={props.addToCartCallback}></button>
                    )
                }
            </div>
        )
    }
}