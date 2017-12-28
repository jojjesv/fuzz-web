import React, { Component } from 'react';
import Category from './Category';

const styles = {
    background: {
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        background: 'rgba(90, 198, 217, 0.63)',
        zIndex: 99,
        transition: 'opacity 250ms'
    },
    list: {
        position: 'absolute',
        textAlign: 'center',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    listItem: {
        margin: 12,
        animationName: 'reveal-category-scale'
    }
}

/**
 * A component which modally presents all categories.
 */
export default class CategoriesExpanded extends React.Component {

    static mountCount = 0;

    componentDidMount(){
        CategoriesExpanded.mountCount++;
    }

    select(data) {
        this.props.selectCategory(data);
    }

    deselect(data) {
        this.props.deselectCategory(data);
    }


    render() {
        let state = this.state;
        let props = this.props;
        let visible = props.visible;

        return (
            <div style={Object.assign({}, styles.background, {
                
                opacity: visible ? 1 : 0

            })} onClick={(ev) => props.dismiss()}>
                <ul style={styles.list} onClick={(ev) => ev.stopPropagation()}>
                    {
                        this.props.categories.map((e, i) => 

                            <Category
                                selectedIds={props.selectedIds}
                                data={e}
                                index={i}
                                style={Object.assign({}, e.style, styles.listItem)}
                                select={this.select.bind(this)}
                                deselect={this.deselect.bind(this)}
                                scale={e.assortment_count_proportion}
                                disableAnimation={CategoriesExpanded.mountCount > 1}/>
                        )
                    }
                </ul>
            </div>
        )
    }
}