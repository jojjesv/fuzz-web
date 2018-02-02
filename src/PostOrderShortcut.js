import React, { Component } from 'react';
import ic_cart from './assets/ic_cart.png'
import './PostOrderShortcut.css';
import Truck from './Truck';
import {
    Transition
} from 'react-transition-group';

/**
 * A component which allows the user to re-show the post order dialog with
 * ETA listening enabled.
 */
export default class PostOrderShortcut extends React.Component {
    onClick(){
        let dialog = this.props.dialog;

        dialog.show();
    }

    render(){
        return (
            <Transition unmountOnExit={true} in={this.props.dialog != null} timeout={{
                enter: 0,
                exit: 250
            }}>
            {
                (state) => (
                    <a id="post-order-shortcut" hidden={state == "exiting" || state == "entering"}
                        onClick={this.onClick.bind(this)}>
                        <Truck />
                        <span>Visa beställning</span>
                    </a>
                )
            }
            </Transition>
        )
    }
}