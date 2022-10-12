import React from "react";
import PropTypes from "prop-types";
import Events from "../../lib/Events";
import Select from "react-select";
import whiteListOptions from "../../configs/whiteListOptions";

var DELIMITER = " ";

export default class AddComponent extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

  randomId() {
    return Math.random()
      .toString(36)
      .substring(2, 9);
  }

  /**
   * Add blank component.
   * If component is instanced, generate an ID.
   */
  addComponent = value => {
    let componentName = value.value;

    var entity = this.props.entity;
    var packageName;
    var selectedOption = this.options.filter(function(option) {
      return option.value === componentName;
    })[0];

    if (AFRAME.components[componentName].multiple) {
      // const id = prompt(
      //   `Provide an ID for this component (e.g., 'foo' for ${componentName}__foo).`
      // );
      // componentName = id ? `${componentName}__${id}` : componentName;
      componentName = `${componentName}__${this.randomId()}`;
    }

    entity.setAttribute(componentName, "");
    Events.emit("componentadd", { entity: entity, component: componentName });
    ga("send", "event", "Components", "addComponent", componentName);
  };

  /**
   * Component dropdown options.
   */
  getComponentsOptions() {
    // const usedComponents = Object.keys(this.props.entity.components);
    // var commonOptions = Object.keys(AFRAME.components)
    //   .filter(function(componentName) {
    //     return (
    //       AFRAME.components[componentName].multiple ||
    //       usedComponents.indexOf(componentName) === -1
    //     );
    //   })
    //   .sort()
    //   .map(function(value) {
    //     return { value: value, label: value, origin: "loaded" };
    //   });

    this.options = whiteListOptions.map(value => ({
      value,
      label: value,
      origin: "loaded"
    }));
    console.log(this.options);
    this.options = this.options.sort(function(a, b) {
      return a.label === b.label ? 0 : a.label < b.label ? -1 : 1;
    });
  }

  renderOption(option) {
    var bullet = (
      <span title="Component already loaded in the scene">&#9679;</span>
    );
    return (
      <strong className="option">
        {option.label} {option.origin === "loaded" ? bullet : ""}
      </strong>
    );
  }

  render() {
    const entity = this.props.entity;
    if (!entity) {
      return <div />;
    }

    this.getComponentsOptions();

    return (
      <div id="addComponentContainer">
        <p id="addComponentHeader">COMPONENTS</p>
        <Select
          id="addComponent"
          className="addComponent"
          classNamePrefix="select"
          ref="select"
          options={this.options}
          simpleValue
          clearable={true}
          placeholder="Add component..."
          noResultsText="No components found"
          onChange={this.addComponent}
          optionRenderer={this.renderOption}
          searchable={true}
        />
      </div>
    );
  }
}

/* eslint-disable no-unused-vars */
/**
 * Check if component has multiplicity.
 */
function isComponentInstanced(entity, componentName) {
  for (var component in entity.components) {
    if (component.substr(0, component.indexOf("__")) === componentName) {
      return true;
    }
  }
}
