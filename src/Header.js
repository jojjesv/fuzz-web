import React, { Component } from "react";
import './Header.css';
import ic_cart from './assets/ic_cart.png';

/**
 * Header/global navigation.
 */
export default class Header extends React.Component {

    state = {
        cartRipples: []
    }

    createCartRipple(){
        this.setState((old) => {
            old.cartRipples.push(
                <div className="circle-ripple"></div>
            );

            return old;
        });
    }

    componentWillReceiveProps(next) {

    }

    render(){
        let cartCost = this.props.cartCost;
        let state = this.state;
        let props = this.props;

        return (
            <header>

                <div>
                    <div id="circle">
                        <div>
                            {
                                state.cartRipples
                            }
                        </div>
                        <p>{state.cartRipples.length}</p>
                        <a id="cart-link" onClick={
                            (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                this.props.showShoppingCart()
                            }
                        }>
                            <img src={ic_cart} /> Kundvagn
                        </a>
                        {
                            cartCost > 0 &&
                            <p id="cart-cost-label">{cartCost} kr</p>
                        }
                    </div>
                </div>
            </header>
        )
    }
}