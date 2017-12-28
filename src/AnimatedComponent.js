import React, { Component } from 'react';

/**
 * Calls an update method with requestAnimationFrame while mounted.
 */
export default class AnimatedComponent extends React.Component {
    mounted = false;

    componentDidMount(){
        this.mounted = true;
        this.update();
    }

    update(){
        if (this.mounted) {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    componentWillUnmount(){
        this.mounted = false;
    }
}
