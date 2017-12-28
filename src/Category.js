import React, { Component } from 'react'
import ic_remove from './assets/ic_category_remove.png';
import ic_remove_dark from './assets/ic_category_remove_dark.png';
import Categories from './Categories';

const styles = {
    categoryRemove: {
        marginRight: 4
    }
}

/**
 * A single component for representing a category.
 */
export default class Category extends React.Component {
    /**
     * Array of IDs of different scales.
     */
    static scaleSelectors = [];

    componentWillMount(){
        Category.mounts++;
    }

    render(){
        let props = this.props;
        let data = props.data;
        let id = data.id;
        let name = data.name;
        let index = props.index || 0;
        let scale = (props.scale || 1);
        let selectedIds = props.selectedIds; // Array of already selected elements

        let selected = selectedIds.indexOf(id) != -1;

        const scaleClass = 'scale-' + scale.toString().replace('.', '')
        if (Category.scaleSelectors.indexOf(scaleClass) == -1) {
            //  First render with this scale
            let style = document.createElement('style');
            style.innerHTML = `
                .${scaleClass}.selected .text {
                    left: ${8 * scale}px;
                }
                .${scaleClass} .remove {
                    margin-left: ${-7 * scale}px;
                }
            `;
            document.head.appendChild(style);
            Category.scaleSelectors.push(scaleClass);
        }

        return (
            <li className={scaleClass + " category-li " + (selected ? "selected" : "") + (props.disableAnimation ? " no-anim" : "")} style={

                Object.assign(
                    { },
                    props.style,
                    {
                        animationDelay: 100 * index + 'ms',
                        fontSize: scale + 'em',
                        padding: (10 * scale) + 'px ' + (18 * scale) + 'px',
                        borderRadius: (26 * scale) + 'px'
                    }
                )
            } key={ id } onClick={
                (ev) => {
                    let wasSelected = selectedIds.indexOf(id) != -1

                    if (wasSelected) {
                        props.deselect(data);
                    } else {
                        props.select(data);
                    }
                } 
            }>
                {
                    selected &&
                    <img className="remove" src={data.is_background_dark ? ic_remove : ic_remove_dark} alt="Markerad" style={{
                        width: (12 * scale) + 'px',
                        height: (12 * scale) + 'px',
                        marginRight: (6 * scale) + 'px'
                    }}/>
                }
                <span className="text">{ name }</span>
            </li>
        )
    }
}