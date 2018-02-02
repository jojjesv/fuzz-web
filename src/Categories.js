import React, { Component, DOMElement } from 'react';
import Backend from './Backend';
import CategoriesExpanded from './CategoriesExpanded';
import './Categories.css';
import Category from './Category';
import { Transition } from 'react-transition-group';

const expandedCategoriesAnimDur = 250;

/**
 * Categories management.
 */
export default class Categories extends React.Component {
    state = {
        items: [],
        categoryElements: [],
        selectedIds: [],    //  Array of selected category IDs
        selected: []    //  Array of selected category objects
    }

    //  Whether a render() call has been made with items.
    hasRenderedItems = false;
    expandCategoriesVisible = false;
    listElement = null;

    constructor(props) {
        super(props)

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.fetch()
    }

    /**
     * Fetches categories.
     */
    fetch(){
        Backend.request("out=categories", null, this.parse.bind(this));
    }

    /**
     * Parses a category fetch response from backend.
     * @param {String} response Categories fetch response.
     */
    parse(response) {
        let json = JSON.parse(response);

        let items = json.items;
        let baseImageUrl = json.base_image_url;

        var leastAssortmentCount = Number.MAX_VALUE;
        var highestAssortmentCount = 0;

        for (let item of items) {
            var style = {
                backgroundColor: "#" + item.color
            };

            if (item.background) {
                style.backgroundImage = 'url(' + baseImageUrl + item.background + ')';
                style.backgroundSize = (item.background_width / 4) + 'px ' + (item.background_height / 4) + 'px';
            }

            let bgRgb = [
                Number.parseInt(item.color.slice(0, 2), 16),
                Number.parseInt(item.color.slice(2, 4), 16),
                Number.parseInt(item.color.slice(4, 6), 16)
            ];

            let isBackgroundDark = (0.299 * bgRgb[0] + 0.587 * bgRgb[1] + 0.114 * bgRgb[2]) / 255.0 < 0.75;

            item.is_background_dark = isBackgroundDark;

            if (isBackgroundDark) {
                style.color = "#fafafa";
            } else {
                style.color = "#212121";
            }

            item.style = style;

            item.assortment_count = Math.max(item.assortment_count, 1);

            if (item.assortment_count < leastAssortmentCount) {
                leastAssortmentCount = item.assortment_count;
            }

            if (item.assortment_count > highestAssortmentCount) {
                highestAssortmentCount = item.assortment_count ;
            }
        }

        //  Calculate assortment count proportions
        for (let item of items) {
            item.assortment_count_proportion = 1 +
                ((item.assortment_count - leastAssortmentCount) / (highestAssortmentCount - leastAssortmentCount));
        }

        this.setState({
            items: items
        });
    }

    /**
     * Called to select a category after a user has selected it.
     * @param {number} id Category ID 
     */
    select(obj) {
        const id = obj.id;
        this.setState((old) => {
            old.selectedIds.push(id);
            old.selected.push(obj);
            old[id.toString()] = "1";
            this.props.onChanged(old.selectedIds, old.selected);
            return old
        });
    }

    /**
     * Called to deselect a category after a user has deselected it.
     * @param {number} id Category ID
     */
    deselect(obj) {
        const id = obj.id;
        const idIndex = this.state.selectedIds.indexOf(id);
        const objIndex = this.state.selected.indexOf(obj);

        if (idIndex != -1) {
            this.setState((old) => {
                old.selectedIds.splice(idIndex, 1);
                old.selected.splice(objIndex, 1);
                old[id.toString()] = "0";
                this.props.onChanged(old.selectedIds, old.selected);
                return old
            });
        }
    }

    componentDidMount(){
        window.addEventListener('resize', this.handleWindowResize);
        this.handleWindowResize();
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.handleWindowResize);
    }

    /**
     * Determines the expand categories button's visibility, based on hidden items in the list.
     */
    handleWindowResize(){
        var hiddenCategories = 0;

        let firstBounds = null;
        let bounds;
        for (let x of this.listElement.children) {
            bounds = x.getBoundingClientRect();

            if (firstBounds == null) {
                //  Each of next boundaries will be compared with this
                firstBounds = bounds;
            } else {
                if (bounds.y > firstBounds.y) {
                    x.style.visibility = "hidden";
                    hiddenCategories++;
                } else {
                    x.style.visibility = "visible";
                }
            }
        }

        const expandCategoriesVisible = hiddenCategories > 0;

        if (expandCategoriesVisible && !this.expandCategoriesVisible) {
            this.props.changeExpandButtonVisibility(true);
        } else if (!expandCategoriesVisible && this.expandCategoriesVisible) {
            this.props.changeExpandButtonVisibility(false);
        }

        this.expandCategoriesVisible = expandCategoriesVisible;
    }

    render(){
        let props = this.props;
        let state = this.state;

        if (state.items.length > 0 && !this.hasRenderedItems) {
            //  Listen for layout
            const listener = setImmediate(() => {
                if (this.listElement.children.length > 0) {
                    this.handleWindowResize();
                    clearInterval(listener);
                }
            }, 16);
            this.hasRenderedItems = true;
        }

        return (
            <div>
                <ul id="categories" ref={(e) => this.listElement = e}>
                    {
                        this.state.items.map((e, i) =>
                            <Category
                                selectedIds={state.selectedIds}
                                data={e}
                                index={i}
                                style={e.style}
                                select={this.select.bind(this)}
                                deselect={this.deselect.bind(this)}/>
                        )
                    }
                </ul>

                <Transition in={props.categoriesExpandedVisible} unmountOnExit={true}
                    timeout={{
                        enter: 0,
                        exit: expandedCategoriesAnimDur
                    }}>
                    {
                        (state) => (
                            <CategoriesExpanded categories={this.state.items} selectedIds={this.state.selectedIds}
                            selectCategory={(data) => {
                                this.select(data)
                            }} deselectCategory={(data) => {
                                this.deselect(data)
                            }} dismiss={this.props.dismissExpandCategories} visible={state == "entered"}/>
                        )
                    }
                </Transition>
            </div>
        );
    }
}