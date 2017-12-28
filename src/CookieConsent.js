import React, { Component } from 'react';
import cookie from 'react-cookies';
import './CookieConsent.css';
import { Transition } from 'react-transition-group';

const animationDuration = 250;
const styles = {
    general: {
        transition: 'transform 250ms'
    },
    hidden: {
        transform: 'translateY(100%)'
    }
};

/**
 * A cookie consent to the user.
 */
export default class CookieConsent extends React.Component {
    showConsent = false;

    state = {
        visible: true
    }

    constructor(props) {
        super(props);

        this.showConsent = cookie.load('has-consent') == null;
    }

    /**
     * Called if the user gives consent to cookies.
     */
    hide(){
        cookie.save('has-consent', '1');
        this.setState({
            visible: false
        })
    }

    render(){
        if (!this.showConsent) {
            return null;
        }

        return (
            <Transition in={this.state.visible} unmountOnExit={true} timeout={{
                enter: 0,
                exit: animationDuration
            }}>
            {
                (state) => (
                    <div id="cookie-consent"
                        style={Object.assign({}, styles.general, state == 'exiting' ? styles.hidden : {})}>
                        <p>Förutom livet förbättrar även kakor Fuzz-webappen!</p>
                        <button onClick={this.hide.bind(this)}>Håller med</button>
                    </div>      
                )
            }
            </Transition>
        );
    }
}