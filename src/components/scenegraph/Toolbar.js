import classnames from "classnames";
import React from "react";
import { whitelistTagNames } from "../../configs/whitelist.js";
import Events from "../../lib/Events.js";
import { saveBlob, saveString } from "../../lib/utils";
import { updateSpace } from "../../services/space.service.js";

const LOCALSTORAGE_MOCAP_UI = "aframeinspectormocapuienabled";

function filterHelpers(scene, visible) {
  scene.traverse(o => {
    if (o.userData.source === "INSPECTOR") {
      o.visible = visible;
    }
  });
}

function getSceneName(scene) {
  return scene.id || slugify(window.location.host + window.location.pathname);
}

/**
 * Slugify the string removing non-word chars and spaces
 * @param  {string} text String to slugify
 * @return {string}      Slugified string
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "-") // Replace all non-word chars with -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false
    };
  }

  exportSceneToGLTF() {
    ga("send", "event", "SceneGraph", "exportGLTF");
    const sceneName = getSceneName(AFRAME.scenes[0]);
    const scene = AFRAME.scenes[0].object3D;
    filterHelpers(scene, false);
    AFRAME.INSPECTOR.exporters.gltf.parse(
      scene,
      function(buffer) {
        filterHelpers(scene, true);
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveBlob(blob, sceneName + ".glb");
      },
      { binary: true }
    );
  }

  addEntity() {
    Events.emit("entitycreate", { element: "a-entity", components: {} });
  }

  /**
   * Try to write changes with aframe-inspector-watcher.
   */
  writeChanges = () => {
    console.log(AFRAME.INSPECTOR.history);
    const scene = AFRAME.scenes[0];

    // Get all entities & attributes.
    const entities = scene.querySelectorAll("*");
    const entitiesData = [];
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      if (!whitelistTagNames.includes(entity.tagName.toLowerCase())) {
        continue;
      }
      // ignore aframe-injected entities
      if (
        !entity.id ||
        entity.hasAttribute("aframe-injected") ||
        entity.hasAttribute("data-aframe-inspector")
      ) {
        continue;
      }
      // Ignore core entities.
      if (entity.hasAttribute("core-entity")) {
        continue;
      }
      const components = entity.components;

      const componentsData = {};
      for (const componentName in components) {
        const component = components[componentName];
        // default components are not in the schema
        if (
          componentName === "position" ||
          componentName === "rotation" ||
          componentName === "scale"
        ) {
          componentsData[componentName] = component.data;
          continue;
        }

        const schema = component.schema;

        if (typeof component.data === "object") {
          console.log(schema);
          const componentData = {};
          for (const property in schema) {
            componentData[property] = component.data[property];
          }
          console.log(componentData);
          componentsData[componentName] = componentData;
        }

        if (typeof component.data === "string") {
          componentsData[componentName] = component.data;
        }
      }
      // console.log(
      //   `Processing entity ${entity.tagName} ${entity.id} ${Object.keys(
      //     componentsData
      //   ).join(", ")}`
      // );

      entitiesData.push({
        id: entity.id,
        position: entity.object3D.position,
        rotation: entity.object3D.rotation.toVector3(),
        scale: entity.object3D.scale,
        components: componentsData
      });
    }

    const documentTitle = document.title;
    document.title = "Saving...";

    updateSpace(entitiesData)
      .then(() => {
        document.title = documentTitle;
        alert("Changes written successfully.");
      })
      .catch(err => {
        // alert("Could not write changes. Error: " + err.message);
        console.error(err);
        document.title = documentTitle;
      });
  };

  toggleScenePlaying = () => {
    if (this.state.isPlaying) {
      AFRAME.scenes[0].pause();
      this.setState({ isPlaying: false });
      AFRAME.scenes[0].isPlaying = true;
      document.getElementById("aframeInspectorMouseCursor").play();
      return;
    }
    AFRAME.scenes[0].isPlaying = false;
    AFRAME.scenes[0].play();
    this.setState({ isPlaying: true });
  };

  render() {
    const watcherClassNames = classnames({
      button: true,
      fa: true,
      "fa-save": true
    });
    const watcherTitle = "Write changes with aframe-watcher.";

    return (
      <div id="toolbar">
        <div className="toolbarActions">
          <a
            className="button fa fa-plus"
            title="Add a new entity"
            onClick={this.addEntity}
          />
          <a
            id="playPauseScene"
            className={
              "button fa " + (this.state.isPlaying ? "fa-pause" : "fa-play")
            }
            title={this.state.isPlaying ? "Pause scene" : "Resume scene"}
            onClick={this.toggleScenePlaying}
          />
          <a
            className="gltfIcon"
            title="Export to GLTF"
            onClick={this.exportSceneToGLTF}
          >
            <img
              src={
                process.env.NODE_ENV === "production"
                  ? "https://aframe.io/aframe-inspector/assets/gltf.svg"
                  : "../assets/gltf.svg"
              }
            />
          </a>
          <a
            className={watcherClassNames}
            title={watcherTitle}
            onClick={this.writeChanges}
          />
        </div>
      </div>
    );
  }
}
