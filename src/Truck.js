import ic_truck_wheel from './assets/ic_truck_wheel.png'
import ic_truck_base from './assets/ic_truck_base.png'
import AnimatedComponent from './AnimatedComponent';
import React, { Component } from 'react'

/**
 * An animated truck.
 */
export default class Truck extends AnimatedComponent {
    state = {
        time: 0
    }

    update(){
        this.setState({
            time: Date.now()
        })
        super.update();
    }

    render(){
        let time = this.state.time;

        let wheelRotation = -time * 0.35;
        let baseOffset = Math.abs(Math.cos(Math.PI * 2 * (wheelRotation / 360)) * 0.5) * 3;

        return (
            <div style={{
                display: 'inline-block'
            }}>
                <img alt="" src={ic_truck_wheel} style={{
                    position: 'absolute',
                    transform: 'rotate(' + wheelRotation + 'deg)',
                    marginLeft: '6px',
                    marginTop: '43px',
                }}/>
                <img alt="" src={ic_truck_base} style={{
                    transform: 'translateY(' + baseOffset + 'px)',
                    position: 'relative',
                    top: 8
                }}/>
                <img alt="" src={ic_truck_wheel} style={{
                    position: 'absolute',
                    transform: 'rotate(' + wheelRotation + 'deg)',
                    marginLeft: '-19px',
                    marginTop: '43px'
                }}/>
            </div>
        )
    }
}