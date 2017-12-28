import React, { Component } from 'react';
import './Loading.css';
import ic_logo from './assets/ic_logo_white_48dp.png';
import { Transition } from 'react-transition-group';

const animationDuration = 200;

const styles = {
    background: {
        zIndex: '99',
        pointerEvents: 'all',
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 1,
        backgroundColor: 'rgba(81, 198, 217, 0.75)',
        transition: `opacity ${animationDuration}ms`
    },
    backgroundHidden: {
        opacity: 0
    },
    spinner: {
        animation: 'loading-spin 1s linear infinite',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
    }
}

/**
 * Component for showing a loading indicator.
 */
export default class LoadingIndicator extends React.Component {
    render(){
        return (
            <Transition component={false} in={this.props.visible} timeout={{
                enter: 0,
                exit: animationDuration
            }} unmountOnExit={true}>
                {
                    (st) => (
                        <div style={st == 'entering' ?
                            Object.assign({}, styles.background, styles.backgroundHidden) :
                            styles.background}>
                            <img src={ic_logo} style={styles.spinner} />
                        </div>   
                    )
                }
            </Transition>
        )
    }
}